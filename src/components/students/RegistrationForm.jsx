import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, UserPlus, Info, Terminal, Calendar as CalendarIcon, Hash, Upload, Phone, BadgePercent, CreditCard, AlertCircle, MapPin, CreditCard as IdCardIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '../../utils/api';

const RegistrationForm = ({ onSuccess, editingStudent }) => {  // ✅ Accept editingStudent prop
  const { courses, batches, students, addStudent, updateStudent } = useApp();  // ✅ Add updateStudent
  const [isOverride, setIsOverride] = useState(false);
  const [isFirstFeePaid, setIsFirstFeePaid] = useState(true);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({}); // live uniqueness errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Initialize formData state with proper structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    courseId: '',
    batchId: '',
    discount: 0,
    totalInstallments: 1,
    joiningDate: new Date().toISOString().split('T')[0],
    customId: '',
    status: 'Active',
  });

  // ✅ Pre-fill form if editing
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        cnic: editingStudent.cnic || '',
        address: editingStudent.address || '',
        courseId: editingStudent.courseId || '',
        batchId: editingStudent.batchId || '',
        discount: editingStudent.discount || 0,
        totalInstallments: editingStudent.totalInstallments || 1,
        joiningDate: editingStudent.commencementDate || new Date().toISOString().split('T')[0],
        customId: editingStudent.customId || '',
        status: editingStudent.status || 'Active',
      });
    }
  }, [editingStudent]);

  // CNIC mask formatter: applies 00000-0000000-0 format
  const formatCnic = (value) => {
    // strip non-digits
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  // Live uniqueness check
  const checkDuplicate = async (field, value) => {
    if (!value || !value.trim()) {
      setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    try {
      const excludeId = editingStudent?.id || null;
      const res = await apiClient.checkStudentExists(field, value.trim(), excludeId);
      if (res.exists) {
        setDuplicateErrors(prev => ({ ...prev, [field]: `This ${field} is already in use` }));
      } else {
        setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch {
      // silently ignore check errors
    }
  };

  const hasDuplicates = Object.values(duplicateErrors).some(v => !!v);

  const [calc, setCalc] = useState({
    originalFee: 0,
    finalFee: 0,
    installmentAmount: 0,
    generatedId: '',
  });

  // Real-time calculation effect - updates instantly when course, discount, or installments change
  useEffect(() => {
    if (!formData.courseId) {
      // Reset when no course selected
      setCalc({
        originalFee: 0,
        finalFee: 0,
        installmentAmount: 0,
        generatedId: '',
      });
      return;
    }

    // Find the selected course and ensure fee is properly extracted
    const course = courses.find(c => {
      const cId = c._id || c.id;
      const fFormId = String(formData.courseId);
      return String(cId) === fFormId;
    });

    if (course && course.fee) {
      const originalFee = Number(course.fee);
      const discountAmount = Number(formData.discount) || 0;
      const finalFee = Math.max(0, originalFee - discountAmount);
      const totalInstallments = Number(formData.totalInstallments) || 1;
      const installmentAmount = totalInstallments > 0 ? finalFee / totalInstallments : 0;

      const year = new Date().getFullYear();
      const coursePrefix = course.code || 'ST';
      const count = students.filter(s => {
        const sid = String(s.customId || '');
        return sid.startsWith(coursePrefix) && sid.includes(String(year));
      }).length + 1;
      const serial = String(count).padStart(3, '0');
      const generatedId = `${coursePrefix}-${year}-${serial}`;

      setCalc({
        originalFee,
        finalFee: Math.round(finalFee * 100) / 100, // Round to 2 decimals
        installmentAmount: Math.round(installmentAmount * 100) / 100,
        generatedId,
      });

      if (!isOverride) {
        setFormData(prev => ({ ...prev, customId: generatedId }));
      }
    } else {
      // Reset if course not found or has no fee
      setCalc({
        originalFee: 0,
        finalFee: 0,
        installmentAmount: 0,
        generatedId: '',
      });
    }
  }, [formData.courseId, formData.discount, formData.totalInstallments, courses, isOverride]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone format. Use any international format (e.g., +1-555-123-4567 or 03-XXX-XXXXXX)';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Course selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (hasDuplicates) {
      toast.error('Please fix the duplicate field errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    const installmentsArr = [];
    const startDate = new Date(formData.joiningDate);

    for (let i = 1; i <= formData.totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i - 1));
      installmentsArr.push({
        installmentNumber: i,
        amount: Math.round(calc.installmentAmount),
        date: dueDate.toISOString().split('T')[0],
        status: (i === 1 && isFirstFeePaid) ? 'Paid' : 'Pending',
        datePaid: (i === 1 && isFirstFeePaid) ? new Date().toISOString().split('T')[0] : undefined
      });
    }

    // Send proper JSON data instead of FormData
    const studentData = {
      customId: formData.customId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cnic: formData.cnic || null,
      address: formData.address || null,
      // Convert to integers (Sequelize expects integers, not strings)
      courseId: formData.courseId ? parseInt(formData.courseId) : null,
      batchId: formData.batchId ? parseInt(formData.batchId) : null,
      // Don't send totalFee - backend keeps original course fee
      discount: Number(formData.discount) || 0,
      totalInstallments: Number(formData.totalInstallments),
      // Send status from form (when editing) or default Active (when creating)
      status: formData.status || 'Active',
    };

    // Send as JSON instead of FormData
    const success = editingStudent ? await updateStudent(editingStudent.id, studentData) : await addStudent(studentData);
    setIsSubmitting(false);
    if (success) {
      toast.success('Student Registered Successfully!');
      onSuccess?.();
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cnic: '',
        address: '',
        courseId: '',
        batchId: '',
        discount: 0,
        totalInstallments: 1,
        joiningDate: new Date().toISOString().split('T')[0],
        customId: '',
        status: 'Active',
      });
      setDuplicateErrors({});
      setEvidenceFile(null);
      setIsFirstFeePaid(true);
      setErrors({});
    } else {
      toast.error('Failed to register student. Please check the form and try again.');
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto border-t-8 border-secondary bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 md:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary/10 text-secondary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
            <UserPlus size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Direct Admission</h2>
            <p className="text-slate-400 font-medium text-xs sm:text-sm">Enroll a new scholar into the system.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Scholar Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Scholar Identifier</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  className={`input-field pl-12 pr-24 sm:pr-28 ${!isOverride ? 'bg-slate-50 text-slate-400' : 'bg-white font-black'}`}
                  value={formData.customId}
                  readOnly={!isOverride}
                  onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setIsOverride(!isOverride)} 
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-black px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  {isOverride ? 'LOCKED' : 'MODIFY'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Full Legal Name</label>
              <input 
                required 
                type="text" 
                className={`input-field ${errors.name ? 'border-red-500 bg-red-50' : ''}`} 
                placeholder="Zain Ali" 
                value={formData.name} 
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }} 
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                  <AlertCircle size={12} />
                  {errors.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Communication Email</label>
              <input 
                required 
                type="email" 
                className={`input-field ${errors.email || duplicateErrors.email ? 'border-red-500 bg-red-50' : ''}`} 
                placeholder="zain.ali@example.com" 
                value={formData.email} 
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                  if (duplicateErrors.email) setDuplicateErrors(prev => ({ ...prev, email: '' }));
                }}
                onBlur={(e) => checkDuplicate('email', e.target.value)}
              />
              {(errors.email || duplicateErrors.email) && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                  <AlertCircle size={12} />
                  {errors.email || duplicateErrors.email}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Mandatory Contact</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required 
                  type="tel" 
                  className={`input-field pl-12 ${errors.phone || duplicateErrors.phone ? 'border-red-500 bg-red-50' : ''}`} 
                  placeholder="0300 1234567" 
                  value={formData.phone} 
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                    if (duplicateErrors.phone) setDuplicateErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  onBlur={(e) => checkDuplicate('phone', e.target.value)}
                />
                {(errors.phone || duplicateErrors.phone) && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                    <AlertCircle size={12} />
                    {errors.phone || duplicateErrors.phone}
                  </div>
                )}
              </div>
            </div>
            {/* CNIC */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">CNIC</label>
              <div className="relative">
                <IdCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text"
                  className={`input-field pl-12 ${duplicateErrors.cnic ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder="00000-0000000-0"
                  value={formData.cnic}
                  maxLength={15}
                  onChange={(e) => {
                    const masked = formatCnic(e.target.value);
                    setFormData({ ...formData, cnic: masked });
                    if (duplicateErrors.cnic) setDuplicateErrors(prev => ({ ...prev, cnic: '' }));
                  }}
                  onBlur={(e) => checkDuplicate('cnic', e.target.value)}
                />
                {duplicateErrors.cnic && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                    <AlertCircle size={12} />
                    {duplicateErrors.cnic}
                  </div>
                )}
              </div>
            </div>
            {/* Address */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Permanent Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-300" size={16} />
                <textarea
                  className="input-field pl-12 resize-none"
                  placeholder="House #, Street, City"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Academic Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-slate-50 border border-slate-100">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Academic Path</label>
              <select 
                required 
                className={`input-field bg-white ${errors.courseId ? 'border-red-500 bg-red-50' : ''}`} 
                value={formData.courseId} 
                onChange={(e) => {
                  setFormData({ ...formData, courseId: e.target.value });
                  if (errors.courseId) setErrors({ ...errors, courseId: '' });
                }}
              >
                <option value="">Select Course Architecture</option>
                {courses.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} {c.fee ? `(Rs. ${c.fee.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                  <AlertCircle size={12} />
                  {errors.courseId}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Cohort / Batch</label>
              <select 
                required 
                className="input-field bg-white" 
                value={formData.batchId} 
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                disabled={!formData.courseId}
              >
                <option value="">Select Target Batch</option>
                {batches.filter(b => {
                  const bCourseId = b.courseId?.id || b.courseId?._id || b.courseId;
                  return bCourseId == formData.courseId;
                }).map(b => (
                  <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">Commencement Date</label>
              <input 
                required 
                type="date" 
                className="input-field bg-white" 
                value={formData.joiningDate} 
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} 
              />
            </div>
          </div>

          {/* Financial Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
            <div>
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 pl-1">Flat Discount (PKR)</label>
              <div className="relative">
                <BadgePercent className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                <input 
                  type="number" 
                  min="0"
                  step="100"
                  className="input-field pl-12 bg-white border-emerald-100 focus:ring-emerald-200" 
                  placeholder="0" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 pl-1">Installment Cycles</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                <select 
                  className="input-field pl-12 bg-white border-emerald-100 focus:ring-emerald-200 font-bold" 
                  value={formData.totalInstallments} 
                  onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Payment' : 'Installments'}</option>
                  ))}
                </select>
              </div>
            </div>

            {editingStudent && (
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 pl-1">Scholar Status</label>
                <div className="relative">
                  <select 
                    className="input-field bg-white border-emerald-100 focus:ring-emerald-200 font-bold" 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">System Active</option>
                    <option value="Settled">Fully Settled</option>
                    <option value="Dropped">Dropped / Dormant</option>
                    <option value="Passout">Passout / Certified</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl sm:rounded-2xl border border-emerald-100 mt-2">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                  <Upload size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">Initial Commitment Verification</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{evidenceFile ? evidenceFile.name : 'No screenshot attached'}</p>
                </div>
              </div>
              <label className="cursor-pointer bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all whitespace-nowrap w-full sm:w-auto text-center sm:text-left">
                {evidenceFile ? 'REPLACE' : 'UPLOAD'}
                <input type="file" className="hidden" onChange={(e) => setEvidenceFile(e.target.files[0])} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Financial Pro-Forma (Sticky on desktop) */}
        <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6 h-fit">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 md:p-10 text-white shadow-[0_30px_60px_-15px_rgba(30,58,138,0.4)] relative overflow-hidden"
          >
            <Terminal className="text-white/5 absolute -right-4 -top-4 hidden sm:block" size={180} />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-6 sm:mb-10">Financial Pro-Forma</p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Base Tuition</span>
                  <span className="font-black text-sm sm:text-base">Rs. {calc.originalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Scholarship</span>
                  <span className="font-black text-sm sm:text-base">- Rs. {Number(formData.discount || 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/10 my-3 sm:my-4" />
                <div className="flex justify-between items-center text-xl sm:text-2xl font-black italic">
                  <span className="tracking-tighter">Total Payable</span>
                  <span className="text-secondary tracking-tighter">Rs. {calc.finalFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-white/5 rounded-xl sm:rounded-[2rem] border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest text-center">Cycle Installment</p>
                <p className="text-2xl sm:text-3xl font-black text-center text-white">Rs. {Math.round(calc.installmentAmount).toLocaleString()}</p>
                {formData.totalInstallments > 1 && (
                  <p className="text-[9px] text-white/50 text-center mt-2 uppercase tracking-widest">
                    {formData.totalInstallments} Installments
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <button 
            type="submit" 
            disabled={hasDuplicates || isSubmitting}
            className={`btn-secondary w-full py-4 sm:py-5 md:py-6 text-lg sm:text-xl font-black tracking-tighter shadow-2xl shadow-secondary/40 active:scale-95 transition-all ${
              hasDuplicates || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'PROCESSING...' : 'CONFIRM ADMISSION'}
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                checked={isFirstFeePaid} 
                onChange={() => setIsFirstFeePaid(!isFirstFeePaid)} 
                className="w-4 h-4 sm:w-5 sm:h-5 accent-secondary flex-shrink-0" 
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Paid</span>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-center">
              <CalendarIcon size={12} className="sm:w-3.5 sm:h-3.5 text-slate-300 mr-1 sm:mr-2" />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
