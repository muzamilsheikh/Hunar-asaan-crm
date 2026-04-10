import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Plus,
    Search,
    Grid,
    List as ListIcon,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Phone,
    Filter,
    X,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import RegistrationForm from '../components/students/RegistrationForm';
import StudentLedger from '../components/students/StudentLedger';
import { Pencil } from 'lucide-react'; // ✅ Import Edit icon
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { apiClient } from '../utils/api';

const Students = () => {
    const { students, courses, batches, loading } = useApp();
    const location = useLocation();
    const [view, setView] = useState('grid');
    const [showRegForm, setShowRegForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null); // ✅ For edit mode
    const [deleteConfirm, setDeleteConfirm] = useState(null); // ✅ For delete confirmation
    const [isDeleting, setIsDeleting] = useState(false); // ✅ Loading state for delete

    // ✅ Handle Edit Student
    const handleEditStudent = (student) => {
      setEditingStudent(student);
      setShowRegForm(true);
    };

    // ✅ Close form and reset editing state
    const handleCloseForm = () => {
      setShowRegForm(false);
      setEditingStudent(null);
    };

    // ✅ Handle Delete Student with confirmation
    const handleDeleteStudent = async (studentId) => {
      setIsDeleting(true);
      try {
        await apiClient.deleteStudent(studentId);
        toast.success('Student record deleted successfully');
        setDeleteConfirm(null);
        // Refresh the page to update the list
        window.location.reload();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.error || 'Failed to delete student');
      } finally {
        setIsDeleting(false);
      }
    };

    useEffect(() => {
        if (location.state?.batchId) {
            setFilters(prev => ({ ...prev, batch: location.state.batchId }));
        }
    }, [location.state]);

    const [filters, setFilters] = useState({
        search: '',
        course: '',
        batch: '',
        status: ''
    });

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            s.customId?.toLowerCase().includes(filters.search.toLowerCase()) ||
            s.phone?.includes(filters.search);

        const sCourseId = s.courseId?._id || s.courseId;
        const sBatchId = s.batchId?._id || s.batchId;

        const matchesCourse = filters.course ? sCourseId === filters.course : true;
        const matchesBatch = filters.batch ? sBatchId === filters.batch : true;

        // Filter by status
        let matchesStatus = true;
        if (filters.status) {
            if (filters.status === 'Active') matchesStatus = s.status === 'Active';
            else if (filters.status === 'Settled') matchesStatus = s.status === 'Settled';
            else if (filters.status === 'Dropped') matchesStatus = s.status === 'Dropped';
            else if (filters.status === 'Passout') matchesStatus = s.status === 'Passout';
            else if (filters.status === 'Paid') matchesStatus = !s.payments?.some(p => p.status === 'Pending');
            else if (filters.status === 'Pending') {
                const hasOverdue = s.payments?.some(p => p.status === 'Pending' && new Date(p.date) < new Date());
                matchesStatus = s.payments?.some(p => p.status === 'Pending') && !hasOverdue;
            }
            else if (filters.status === 'Overdue') {
                matchesStatus = s.payments?.some(p => p.status === 'Pending' && new Date(p.date) < new Date());
            }
        }

        return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
    });

    if (loading && students.length === 0) return <div className="h-[80vh] flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-[0.5em]">Synchronizing Registry...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Core Registry Database</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">Student Directory</h2>
                    <p className="text-slate-400 mt-2 font-black uppercase text-[10px] tracking-widest italic opacity-60">Manage profiles, financial ledger and system status.</p>
                </div>
                <button onClick={() => setShowRegForm(true)} className="btn-secondary py-4 sm:py-5 px-6 sm:px-10 flex items-center gap-2 sm:gap-3 shadow-2xl shadow-secondary/40 active:scale-95 transition-all w-full sm:w-auto justify-center">
                    <Plus size={20} sm:size={24} />
                    <span className="font-black tracking-tight text-base sm:text-lg">Launch Admission</span>
                </button>
            </div>

            {/* Filtering System */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                        <input
                            type="text"
                            placeholder="Search by Name, ID or Phone Identifier..."
                            className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-secondary/5 outline-none transition-all font-bold text-slate-600"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200">
                        <button onClick={() => setView('grid')} className={cn("p-4 rounded-xl transition-all", view === 'grid' ? 'bg-white shadow-xl text-secondary' : 'text-slate-400')}>
                            <Grid size={24} />
                        </button>
                        <button onClick={() => setView('list')} className={cn("p-4 rounded-xl transition-all", view === 'list' ? 'bg-white shadow-xl text-secondary' : 'text-slate-400')}>
                            <ListIcon size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-slate-50">
                    <select className="input-field py-4 bg-slate-50 border-transparent font-bold text-xs uppercase tracking-widest" value={filters.course} onChange={e => setFilters({ ...filters, course: e.target.value })}>
                        <option value="">All Academic Paths</option>
                        {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                    </select>
                    <select className="input-field py-4 bg-slate-50 border-transparent font-bold text-xs uppercase tracking-widest" value={filters.batch} onChange={e => setFilters({ ...filters, batch: e.target.value })}>
                        <option value="">All Active Batches</option>
                        {batches.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
                    </select>
                    <select className="input-field py-4 bg-slate-50 border-transparent font-bold text-xs uppercase tracking-widest" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">Filter by Status</option>
                        <option value="Active">System Active</option>
                        <option value="Settled">Fully Settled</option>
                        <option value="Dropped">Dropped / Dormant</option>
                        <option value="Passout">Passout / Certified</option>
                        <option value="Paid">Fully Paid</option>
                        <option value="Pending">Payment Pending</option>
                        <option value="Overdue">Past Due (Alert)</option>
                    </select>
                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => setFilters({ search: '', course: '', batch: '', status: '' })}
                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-2 bg-rose-50 px-6 py-4 rounded-2xl border border-rose-100"
                        >
                            <X size={14} /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
                {filteredStudents.map((student) => {
                    const studentCourseId = student.courseId?._id || student.courseId;
                    const course = courses.find(c => (c._id === studentCourseId || c.id === studentCourseId));
                    const netPayable = (student.totalFee || 0) - (student.discount || 0);
                    const progress = netPayable ? ((student.paidAmount || 0) / netPayable) * 100 : 0;

                    const today = new Date().toISOString().split('T')[0];
                    const hasOverdue = student.payments?.some(p => p.status === 'Pending' && p.date < today);
                    const hasPending = student.payments?.some(p => p.status === 'Pending');

                    return view === 'grid' ? (
                        <motion.div
                            layout
                            key={student._id || student.id}
                            className="glass-card group hover:border-secondary transition-all cursor-pointer bg-white relative p-1 leading-none shadow-xl hover:shadow-2xl"
                            onClick={() => setSelectedStudentId(student._id || student.id)}
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-300 flex items-center justify-center font-black text-4xl border border-slate-100 group-hover:bg-primary group-hover:text-secondary transition-all duration-700 shadow-inner group-hover:rotate-6">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                                            hasOverdue ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                                                !hasPending ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                        )}>
                                            {hasOverdue ? 'Overdue' : !hasPending ? 'Settled' : 'Cycle Active'}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 tracking-[0.4em] italic">{student.customId}</p>
                                    </div>
                                </div>

                                <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-4 uppercase">{student.name}</h4>
                                <div className="flex items-center gap-4 text-slate-400 mb-10">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Phone size={12} className="text-secondary" />
                                        <span className="text-[10px] font-black tracking-widest text-slate-600">{student.phone || 'N/A'}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest italic">{course?.name}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                        <span>Tuition Clearance</span>
                                        <span className="text-slate-800">{Math.round(progress)}% Verified</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className={cn("h-full rounded-full transition-all duration-1000", hasOverdue ? 'bg-rose-500' : 'bg-secondary')}
                                        />
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-between pt-10 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-2 leading-none">Unpaid Balance</p>
                                        <p className="font-black text-slate-800 text-2xl tracking-tighter italic leading-none">Rs. {(student.totalFee - student.discount- student.paidAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* ✅ Edit Button */}
                                        <button
                                            onClick={(e) => {
                                               e.stopPropagation();
                                                handleEditStudent(student);
                                            }}
                                            className="w-12 h-12 bg-blue-50 text-blue-500 rounded-[1.2rem] flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-blue-100 hover:shadow-md"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        {/* ✅ Delete Button */}
                                        <button
                                            onClick={(e) => {
                                               e.stopPropagation();
                                                setDeleteConfirm(student);
                                            }}
                                            className="w-12 h-12 bg-red-50 text-red-500 rounded-[1.2rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 hover:shadow-md active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {/* View Button */}
                                        <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-[1.2rem] flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all shadow-sm border border-slate-100 group-hover:translate-x-1 group-hover:-translate-y-1">
                                            <Eye size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            key={student._id || student.id}
                            className="glass-card flex items-center justify-between p-8 hover:border-secondary cursor-pointer bg-white group shadow-xl hover:shadow-2xl transition-all border border-slate-50 rounded-[2rem]"
                            onClick={() => setSelectedStudentId(student._id || student.id)}
                        >
                            <div className="flex items-center gap-8 flex-1">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-200 border border-slate-100 group-hover:bg-primary group-hover:text-secondary transition-all shadow-inner group-hover:rotate-12">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-2xl tracking-tight leading-none mb-2 uppercase">{student.name}</p>
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] italic">{student.customId}</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} className="text-slate-300" />
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 hidden md:block">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 opacity-60">Settled Amount</p>
                                <p className="font-black text-slate-800 text-lg tracking-tight italic">Rs. {(student.paidAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-12">
                                <div className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                    hasOverdue ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                                        !hasPending ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                )}>
                                    {hasOverdue ? 'Overdue Status' : !hasPending ? 'Fully Cleared' : 'Cycle Pending'}
                                </div>
                                <div className="p-4 bg-slate-50 text-slate-200 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                                    <Eye size={24} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showRegForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
                        <div className="min-h-[140vh] py-20 w-full flex items-center justify-center">
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="w-full max-w-5xl relative">
                                <button onClick={handleCloseForm} className="absolute -top-16 right-0 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-2xl">
                                    Abandom Admission Portal
                                </button>
                                <RegistrationForm editingStudent={editingStudent} onSuccess={() => handleCloseForm()} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {selectedStudentId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-50/50 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto">
                        <div className="min-h-[180vh] py-20 w-full flex items-center justify-center">
                            <motion.div initial={{ scale: 0.95, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 50 }} className="w-full max-w-6xl relative">
                                <button onClick={() => setSelectedStudentId(null)} className="absolute -top-16 right-0 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4 bg-white px-8 py-4 rounded-full border border-slate-100 hover:border-rose-100 transition-all shadow-2xl">
                                    Exit Scholar Ledger
                                </button>
                                <StudentLedger studentId={selectedStudentId} onUpdate={() => { }} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isDeleting && setDeleteConfirm(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 px-8 py-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Delete Student Record?</h3>
                                        <p className="text-sm text-slate-500 mt-1">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-8 space-y-6">
                                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">This will permanently delete:</p>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            Student Record: <span className="font-bold text-slate-800">{deleteConfirm.name}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            User Account: <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200">{deleteConfirm.email}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            All Payment Records: <span className="font-bold text-slate-800">{deleteConfirm.payments?.length || 0} records</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <p className="text-xs text-amber-700 font-semibold">
                                        ⚠️ Archival Tip: Consider marking the student as "Dropped" instead of deletion to preserve financial history.
                                    </p>
                                </div>

                                <p className="text-sm text-slate-600">Are you absolutely sure you want to delete this student and all associated records?</p>
                            </div>

                            {/* Actions */}
                            <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteStudent(deleteConfirm.id || deleteConfirm._id)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Students;
