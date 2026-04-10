import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Clock, User, ArrowRight, Play, BookOpen, Video, CreditCard, Receipt, MapPin, Phone, Mail, CheckCircle, PlusCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const { user, api } = useApp();
    const [studentData, setStudentData] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [liveClass, setLiveClass] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Main navigation tabs
    const [mainTab, setMainTab] = useState('learning'); // 'learning', 'financials', 'catalog'
    const [activeFilter, setActiveFilter] = useState('All courses');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                if (user?.email) {
                    setLoading(true);
                    
                    // Fetch Courses
                    api.getCourses().then(res => {
                        if (Array.isArray(res)) {
                            setAvailableCourses(res);
                        } else if (res.courses) {
                            setAvailableCourses(res.courses);
                        }
                    }).catch(e => console.error(e));

                    const allStudents = await api.getStudents();
                    const student = allStudents.find(s => s?.email?.toLowerCase() === user?.email?.toLowerCase());
                    
                    if (student) {
                        const sid = student.id || student._id;
                        const details = await api.getStudentById(sid);
                        setStudentData(details.student);
                        setEnrollments(details.enrollments || []);
                        
                        // Fetch Payments
                        try {
                            const paymentsRes = await api.getPaymentsByStudent(sid);
                            if (paymentsRes.success || paymentsRes.payments) {
                                setPayments(paymentsRes.payments || paymentsRes);
                            }
                        } catch (e) { console.error('Error fetching payments', e); }

                        try {
                            const liveSessionResponse = await api.getStudentLiveSession();
                            if (liveSessionResponse.success && liveSessionResponse.liveSession) {
                                setLiveClass(liveSessionResponse.liveSession);
                            }
                        } catch (e) { /* ignore */ }
                    }
                }
            } catch (error) {
                console.error('Error fetching student dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAllData();
        }
    }, [user, api]);

    const handleEnroll = async (courseId) => {
        if (!studentData) return;
        setEnrolling(true);
        try {
            // Check if already enrolled
            const alreadyEnrolled = enrollments.some(e => e.Course?.id === courseId || e.courseId === courseId);
            if (alreadyEnrolled) {
                toast.error('You are already enrolled or have applied for this course!');
                setEnrolling(false);
                return;
            }

            const courseDetails = availableCourses.find(c => c.id === courseId);
            const res = await api.createEnrollment({
                studentId: studentData.id,
                courseId: courseId,
                status: 'Pending',
                totalFee: courseDetails?.fee || 0,
                enrollmentDate: new Date().toISOString()
            });
            
            toast.success('Successfully applied for the new course!');
            // Refresh enrollments slightly fake update for fast UI
            setEnrollments([...enrollments, { 
                id: Math.random(), 
                Course: courseDetails, 
                category: 'New Application', 
                status: 'Pending',
                totalFee: courseDetails?.fee || 0,
                completionPercentage: 0, 
                totalLessons: 30 
            }]);
            setMainTab('learning');
        } catch (error) {
            toast.error('Failed to enroll. Please contact administration.');
        }
        setEnrolling(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2B5CE6] rounded-full animate-spin" />
                <div className="text-slate-400 font-bold text-xs">Loading dashboard...</div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 font-bold">
                Student record not found. Please contact administration.
            </div>
        );
    }

    const filters = ['All courses', 'Design', 'Business', 'Programming', 'Languages'];

    const cardThemes = [
        { bg: 'bg-[#2B5CE6]', text: 'text-white', btn: 'bg-[#d8f030] text-black hover:bg-[#c9e020]' },
        { bg: 'bg-[#FF5A36]', text: 'text-white', btn: 'bg-[#d8f030] text-black hover:bg-[#c9e020]' },
        { bg: 'bg-[#1e1e1e]', text: 'text-white', btn: 'bg-[#d8f030] text-black hover:bg-[#c9e020]' },
        { bg: 'bg-[#10b981]', text: 'text-white', btn: 'bg-white text-black hover:bg-slate-100' },
        { bg: 'bg-[#8b5cf6]', text: 'text-white', btn: 'bg-[#d8f030] text-black hover:bg-[#c9e020]' },
    ];

    const displayCourses = enrollments.length > 0 ? enrollments : [
        { id: 1, Course: { name: 'UX Fundamentals: Crafting Better Interfaces' }, category: 'Design', completionPercentage: 35, lessonsCompleted: 8, totalLessons: 24, peers: 110 },
        { id: 2, Course: { name: 'Startup Finance Essentials' }, category: 'Business', completionPercentage: 50, lessonsCompleted: 15, totalLessons: 30, peers: 86 },
    ];

    const nextLessons = [
        { id: 1, title: 'Introduction to UX Principles', desc: 'Foundations of user-centered design', teacher: 'Alex Chen', duration: '20 min', img: 'https://i.pravatar.cc/150?u=1' },
        { id: 2, title: 'Color Theory in Digital Design', desc: 'Understanding palettes and contrasts', teacher: 'Mia Roberts', duration: '25 min', img: 'https://i.pravatar.cc/150?u=2' },
        { id: 3, title: 'Basics of Financial Forecasting', desc: 'Planning budgets with real data', teacher: 'Priya Kapoor', duration: '22 min', img: 'https://i.pravatar.cc/150?u=3' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-fit mt-2">
                {[
                    { id: 'learning', icon: BookOpen, label: 'My Learning' },
                    { id: 'financials', icon: CreditCard, label: 'Profile & Financials' },
                    { id: 'catalog', icon: PlusCircle, label: 'Browse Courses' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMainTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                            mainTab === tab.id 
                                ? "bg-slate-900 text-white shadow-md transform -translate-y-0.5" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB: MY LEARNING */}
            {mainTab === 'learning' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <h1 className="text-3xl font-semibold text-slate-800">My courses</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-medium transition-all",
                                        activeFilter === filter 
                                            ? "bg-[#2B5CE6] text-white" 
                                            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayCourses.map((enr, idx) => {
                            const theme = cardThemes[idx % cardThemes.length];
                            const pct = enr.completionPercentage || 0;
                            const cat = enr.category || (enr.Course?.name?.includes('Design') ? 'Design' : 'Tech');
                            const comp = enr.lessonsCompleted || Math.floor((pct/100) * 30);
                            const total = enr.totalLessons || 30;

                            return (
                                <div key={enr.id} className={cn(`${theme.bg} ${theme.text} p-6 rounded-[2rem] flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-sm`)}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-black/20 rounded-full text-xs font-medium backdrop-blur-sm">
                                                {cat}
                                            </span>
                                            <Bookmark size={20} className="opacity-80" />
                                        </div>
                                        <h3 className="text-[1.35rem] font-medium leading-tight mb-8">
                                            {enr.Course?.name}
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-medium opacity-80 mb-2">
                                                <span>Progress</span>
                                                <span>{comp}/{total} lessons</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-transparent relative z-10 overflow-hidden" style={{ borderColor: theme.bg }}>
                                                        <img src={`https://i.pravatar.cc/150?u=${idx * 10 + i}`} alt="Avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                <div className="w-8 h-8 rounded-full bg-white text-slate-800 text-[9px] font-bold flex items-center justify-center border-2 border-transparent z-0" style={{ borderColor: theme.bg }}>
                                                    +{enr.peers || 42}
                                                </div>
                                            </div>
                                            <button className={cn(`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${theme.btn}`)}>
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* My Next Lessons */}
                        <div className="xl:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">My next lessons</h2>
                                <button className="text-[#FF5A36] text-sm font-medium hover:underline">View all lessons</button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2 px-2">
                                    <div className="col-span-7 md:col-span-8">Lesson</div>
                                    <div className="col-span-3 md:col-span-3">Teacher</div>
                                    <div className="col-span-2 md:col-span-1 text-right">Duration</div>
                                </div>
                                {nextLessons.map((lesson) => (
                                    <div key={lesson.id} className="grid grid-cols-12 items-center bg-transparent border-b border-slate-100 last:border-0 hover:bg-white p-3 rounded-2xl transition-all cursor-pointer">
                                        <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 hidden sm:flex items-center justify-center flex-shrink-0 text-slate-400">
                                                <Play size={16} className="ml-0.5" />
                                            </div>
                                            <div>
                                                <h4 className="text-slate-800 font-medium text-sm">{lesson.title}</h4>
                                                <p className="text-slate-500 text-xs">{lesson.desc}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 md:col-span-3 flex items-center gap-3">
                                            <img src={lesson.img} alt={lesson.teacher} className="w-8 h-8 rounded-full object-cover hidden sm:block" />
                                            <span className="text-slate-700 text-sm">{lesson.teacher}</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 text-right font-medium text-slate-700">
                                            {lesson.duration}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* New Course Interest */}
                        <div className="bg-[#B9F529] p-8 rounded-[2rem] flex flex-col justify-between min-h-[300px]">
                            <div>
                                <p className="text-slate-800 font-medium text-sm mb-4">Course matching your interests</p>
                                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">Design</span>
                                <h2 className="text-3xl lg:text-4xl font-medium text-slate-900 mt-6 leading-tight">
                                    Advanced Typography<br />for Digital Products
                                </h2>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm font-medium text-slate-800 mb-3">They are already studying</p>
                                <div className="flex -space-x-2 mb-6">
                                    {[4, 5, 6].map(i => (
                                        <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#B9F529]" />
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-white text-slate-800 text-xs font-bold flex items-center justify-center border-2 border-[#B9F529]">
                                        +100
                                    </div>
                                </div>
                                <button className="w-full bg-[#FF5A36] hover:bg-[#e04523] text-white py-4 rounded-full font-medium transition-all shadow-sm">
                                    View Full Catalog
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PROFILE & FINANCIALS */}
            {mainTab === 'financials' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-semibold text-slate-800">Profile & Financials</h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Section */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2B5CE6] to-[#8b5cf6] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-200">
                                {studentData.name?.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{studentData.name}</h2>
                            <p className="text-slate-500 text-sm mb-6">{studentData.customId || 'Standard Student'}</p>
                            
                            <div className="w-full space-y-4 text-left">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Mail className="text-slate-400" size={18} />
                                    <span className="text-sm font-medium text-slate-700">{studentData.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Phone className="text-slate-400" size={18} />
                                    <span className="text-sm font-medium text-slate-700">{studentData.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <MapPin className="text-slate-400" size={18} />
                                    <span className="text-sm font-medium text-slate-700">{studentData.address || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                                    <CheckCircle className="text-emerald-500" size={18} />
                                    <span className="text-sm font-bold">Status: {studentData.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Details Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Fee', val: studentData.totalFee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    { label: 'Discount', val: studentData.discount, color: 'text-rose-600', bg: 'bg-rose-50' },
                                    { label: 'Total Paid', val: studentData.totalPaid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Pending', val: (studentData.totalFee - (studentData.discount || 0) - (studentData.totalPaid || 0)), color: 'text-amber-600', bg: 'bg-amber-50' },
                                ].map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-[2rem] border border-white/50 shadow-sm flex flex-col justify-center ${stat.bg}`}>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                                        <p className={`text-xl font-bold ${stat.color}`}>Rs. {(stat.val || 0).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Details */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Receipt className="text-[#FF5A36]" size={20} />
                                    Fee & Installment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50">
                                        <p className="text-xs text-slate-400 capitalize mb-1">Total Installments Allowed</p>
                                        <p className="text-lg font-semibold text-slate-800">{studentData.totalInstallments}</p>
                                    </div>
                                    <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50">
                                        <p className="text-xs text-slate-400 capitalize mb-1">Next Payment Due Date</p>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {studentData.next_due_date ? new Date(studentData.next_due_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No pending dues'}
                                        </p>
                                    </div>
                                    <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 md:col-span-2 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-slate-400 capitalize mb-1">CNIC / Registration ID</p>
                                            <p className="text-lg font-semibold text-slate-800">{studentData.cnic || 'Not provided'}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                                            <User className="text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: BROWSE COURSES */}
            {mainTab === 'catalog' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-semibold text-slate-800">Course Catalog</h1>
                    <p className="text-slate-500 max-w-2xl">Browse the latest courses available at the institute and easily enroll into new programs. Learn the most in-demand skills.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableCourses.length > 0 ? availableCourses.map((course, idx) => {
                            const theme = cardThemes[idx % cardThemes.length];
                            
                            // Check if student is already enrolled in this exact course
                            const isEnrolled = enrollments.some(e => e.Course?.id === course.id || e.courseId === course.id);

                            return (
                                <div key={course.id} className={cn("bg-white border border-slate-200 p-6 rounded-[2rem] flex flex-col justify-between min-h-[220px] hover:shadow-xl transition-all")}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", theme.bg, theme.text)}>
                                                {course.code || 'COUR'}
                                            </span>
                                            <span className="font-bold text-amber-500">Rs. {course.fee?.toLocaleString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">
                                            {course.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <Clock size={14} /> {course.duration || 'Flexible Duration'}
                                        </p>
                                    </div>
                                    <div className="mt-8">
                                        {isEnrolled ? (
                                            <button disabled className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                <CheckCircle size={18} /> Currently Enrolled
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={enrolling}
                                                className={cn("w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm", theme.bg, theme.text, "hover:opacity-90 active:scale-95")}
                                            >
                                                <PlusCircle size={18} /> 
                                                {enrolling ? 'Enrolling...' : 'Apply for Course'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="col-span-12 py-20 text-center flex flex-col items-center gap-4">
                                <BookOpen size={48} className="text-slate-300" />
                                <p className="text-lg text-slate-400 font-medium">No courses available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Live Class Indicator (if available) - Global over all tabs */}
            {liveClass && (
                <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm flex gap-4 items-start z-50 animate-in slide-in-from-bottom">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Video size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-400 font-bold text-xs uppercase tracking-widest">Live Now</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <h4 className="font-medium text-sm">{liveClass.topic}</h4>
                        {liveClass.classLink && (
                            <a href={liveClass.classLink} target="_blank" rel="noreferrer" className="mt-3 inline-block px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                                Join Session
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
