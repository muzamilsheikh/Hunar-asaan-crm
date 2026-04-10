import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
    Users, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle, Clock, UserPlus, Receipt, Layers, Sparkles, TrendingUp, MessageCircle, ExternalLink, DollarSign, TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationForm from '../components/students/RegistrationForm';
import { cn } from '../utils/cn';
import apiClient from '../utils/api';

// Recharts imports for professional analytics
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color, subtext }) => (
    <motion.div whileHover={{ y: -5 }} className="glass-card p-8 flex flex-col justify-between border-b-4 border-b-transparent hover:border-b-secondary transition-all bg-white shadow-xl shadow-slate-200/50">
        <div className="flex justify-between items-start mb-6">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
            )}>
                <Icon size={28} />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                    trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                )}>
                    {trend > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">{subtext}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { students, getStats, loading } = useApp();
    const [showRegModal, setShowRegModal] = useState(false);
    const [recoveryAlerts, setRecoveryAlerts] = useState([]);
    const [pendingFeesSummary, setPendingFeesSummary] = useState({});
    const [alertsLoading, setAlertsLoading] = useState(false);
    const [paused, setPaused] = useState(false); // 🔥 NEW: For scroller pause
    const [financialStats, setFinancialStats] = useState({
        totalStudents: 0,
        totalPending: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        chartData: [],
        feeDistribution: { collected: 0, outstanding: 0 }
    });
    const [financialLoading, setFinancialLoading] = useState(false);
    const stats = getStats();

    // 🔥 NEW: Calculate Gross Business Value (Combined Portfolio)
    const grossBusinessValue = (financialStats.totalRevenue || 0) + (financialStats.totalPending || 0);

    // Fetch financial stats on component mount
    useEffect(() => {
        fetchFinancialStats();
        fetchRecoveryAlerts();
    }, []);

    const fetchFinancialStats = async () => {
        try {
            setFinancialLoading(true);
            const response = await apiClient.get('/stats/financial-dashboard');
            if (response.success) {
                setFinancialStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching financial stats:', err);
        } finally {
            setFinancialLoading(false);
        }
    };

    const fetchRecoveryAlerts = async () => {
        try {
            setAlertsLoading(true);
            const [alertsRes, summaryRes] = await Promise.all([
                apiClient.getRecoveryAlerts().catch(() => ({ alerts: [] })),
                apiClient.getPendingFeesSummary().catch(() => ({ totalPendingFees: 0, totalStudentsOverdue: 0 }))
            ]);
            
            setRecoveryAlerts(alertsRes?.alerts || []);
            setPendingFeesSummary(summaryRes || {});
        } catch (err) {
            console.error('Error fetching recovery alerts:', err);
            setRecoveryAlerts([]);
        } finally {
            setAlertsLoading(false);
        }
    };

    const handleWhatsAppClick = (student) => {
        // Construct WhatsApp message
        const message = `Hello ${student.name}, your payment is overdue for ${student.daysOverdue} days. Pending amount: Rs. ${student.overdueAmount?.toLocaleString() || 0}. Please settle your fee at your earliest.`;
        const whatsappUrl = `https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) return <div className="h-[80vh] flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-[0.5em]">Syncing Production Data...</div>;
    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* 🚀 Header: Tactical Intelligence Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-secondary animate-pulse" />
                        <span className="text-xs font-black text-secondary uppercase tracking-[0.4em]">Live Enterprise Portal</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase italic">Institutional Command</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-1">Operations & Financial Oversight Suite</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => setShowRegModal(true)} 
                        className="btn-secondary py-4 px-8 flex items-center gap-3 shadow-2xl shadow-secondary/30 active:scale-95 transition-all flex-1 sm:flex-none justify-center"
                    >
                        <UserPlus size={20} />
                        <span className="font-black tracking-tight">Launch Admission</span>
                    </button>
                </div>
            </div>

            {/* 💎 Master Metric: Gross Business Portfolio Value */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="glass-card p-10 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-white/5"
            >
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10">
                                <TrendingUp className="text-secondary" size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-indigo-200 uppercase tracking-[0.3em]">Total Portfolio Worth</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Revenue + Outstanding Assets</p>
                            </div>
                        </div>
                        
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter italic text-white drop-shadow-2xl">
                                Rs. {grossBusinessValue?.toLocaleString()}
                            </h2>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Live System Data
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all">
                                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 opacity-60">Verified Revenue (Collected)</p>
                                <p className="text-2xl font-black text-emerald-400 tracking-tight">Rs. {financialStats.totalRevenue?.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all">
                                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 opacity-60">Growth Forecast (Outstanding)</p>
                                <p className="text-2xl font-black text-amber-400 tracking-tight">Rs. {financialStats.totalPending?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-80 flex flex-col justify-center p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Capital Efficiency Ratio</p>
                            <div className="relative inline-flex flex-col items-center">
                                <div className="text-4xl font-black italic text-secondary">
                                    {financialStats.totalRevenue ? Math.round((financialStats.totalRevenue / (grossBusinessValue || 1)) * 100) : 0}%
                                </div>
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Realization</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden shadow-inner mb-4">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(financialStats.totalRevenue / (grossBusinessValue || 1)) * 100}%` }}
                                className="h-full bg-gradient-to-r from-secondary to-amber-500"
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                            <span>Collected</span>
                            <span>Outstanding</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 📊 High-Performance Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Students" value={financialStats.totalStudents || stats.totalStudents} icon={Users} trend={12} color="secondary" subtext="Active Enrollment" />
                <StatCard title="Financial Assets" value={`Rs. ${financialStats.totalRevenue?.toLocaleString()}`} icon={ArrowUpRight} trend={19} color="secondary" subtext="Realized Revenue" />
                <StatCard title="Pending Credit" value={`Rs. ${financialStats.totalPending?.toLocaleString()}`} icon={ArrowDownLeft} color="primary" subtext="Recovery Pipeline" />
                <StatCard title="Operational Burn" value={`Rs. ${financialStats.totalExpenses?.toLocaleString()}`} icon={Wallet} trend={-4} color="primary" subtext="Monthly Costs" />
                <StatCard title="Net Yield" value={`Rs. ${financialStats.netProfit?.toLocaleString()}`} icon={DollarSign} trend={8} color={financialStats.netProfit >= 0 ? "secondary" : "primary"} subtext="Bottom Line Performance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 🚨 Recovery Scroller Section */}
                <div className="lg:col-span-2 glass-card p-10 bg-white border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-inner group-hover:scale-110 transition-transform">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h4 className="font-black text-2xl text-slate-800 tracking-tight">Automated Recovery Engine</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Installment Surveillance ({recoveryAlerts.length} Active)</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ rotate: 180 }}
                            onClick={fetchRecoveryAlerts}
                            className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-secondary hover:text-white transition-all shadow-lg"
                            disabled={alertsLoading}
                        >
                            <Sparkles size={20} className={alertsLoading ? 'animate-spin' : ''} />
                        </motion.button>
                    </div>

                    <div className="relative">
                        {alertsLoading ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[3rem] animate-pulse flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-secondary rounded-full animate-spin" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Scanning Financial Database...</p>
                            </div>
                        ) : recoveryAlerts.length > 0 ? (
                            <div 
                                className="relative h-[400px] overflow-hidden rounded-[2.5rem] bg-slate-50/50 p-3"
                                onMouseEnter={() => setPaused(true)}
                                onMouseLeave={() => setPaused(false)}
                            >
                                <motion.div
                                    animate={{
                                        y: (paused || recoveryAlerts.length < 4) ? 0 : [0, -(recoveryAlerts.length * 96)],
                                    }}
                                    transition={{
                                        duration: recoveryAlerts.length * 5,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="space-y-4"
                                >
                                    {[...recoveryAlerts, ...recoveryAlerts].map((alert, idx) => (
                                        <motion.div
                                            key={`${alert.id}-${idx}`}
                                            whileHover={{ scale: 1.02, x: 10 }}
                                            onClick={() => (window.location.href = `/students/${alert.studentId}`)}
                                            className={cn(
                                                "flex items-center justify-between p-6 rounded-3xl cursor-pointer transition-all border-2 bg-white",
                                                alert.category === 'OVERDUE' 
                                                    ? "border-rose-100 shadow-xl shadow-rose-200/20 group hover:border-rose-500" 
                                                    : "border-amber-100 shadow-xl shadow-amber-200/20 hover:border-amber-400"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-lg shadow-xl",
                                                    alert.category === 'OVERDUE' ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white animate-pulse" : "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                                                )}>
                                                    {alert.studentName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-base uppercase tracking-tight">{alert.studentName}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.courseName}</p>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <p className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            alert.category === 'OVERDUE' ? "text-rose-500" : "text-amber-500"
                                                        )}>
                                                            {alert.category === 'OVERDUE' ? `${Math.abs(alert.daysRemaining)} Days Lag` : `Due in ${alert.daysRemaining} days`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "font-black text-xl",
                                                    alert.category === 'OVERDUE' ? "text-rose-600" : "text-amber-600"
                                                )}>
                                                    Rs. {alert.amount?.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-2 justify-end mt-1">
                                                    <Clock size={12} className="text-slate-300" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {new Date(alert.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 to-transparent z-10 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                                    <Sparkles size={40} />
                                </div>
                                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em]">System Verified: 100% Capital Recovery</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ⚡ Quick Actions Section */}
                <div className="glass-card p-10 bg-primary text-white relative overflow-hidden flex flex-col justify-between shadow-[0_40px_80px_-20px_rgba(30,58,138,0.4)] md:min-h-[600px]">
                    <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                    <Layers className="absolute -right-10 -bottom-10 text-white/5 opacity-10" size={300} />

                    <div className="relative z-10">
                        <h4 className="font-black text-3xl mb-10 tracking-tighter italic">Enterprise Actions</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Register New Student', icon: UserPlus, action: () => setShowRegModal(true) },
                                { label: 'Log Financial Expense', icon: Wallet, action: () => { window.location.href = '/expenses' } },
                                { label: 'Batch Intelligence', icon: Layers, action: () => { window.location.href = '/batches' } },
                                { label: 'Generate Reports', icon: Receipt, action: () => { window.location.href = '/reports' } }
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className="w-full bg-white/5 hover:bg-white/15 text-white rounded-[2rem] p-6 text-left transition-all border border-white/10 flex items-center gap-5 group backdrop-blur-xl hover:translate-x-3 shadow-2xl"
                                >
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">{item.label}</p>
                                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.2em] mt-1">Initialize Module</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 mt-10 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Production V2.5.0</p>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 📉 Intelligence Visualizer Section */}
            <div className="space-y-10">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Business Intelligence Dashboard</h3>
                    <div className="flex items-center gap-3 py-2 px-4 bg-white rounded-full shadow-sm border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-Time Core Sync</span>
                    </div>
                </div>

                <div className="glass-card p-10 bg-white border border-slate-100 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="font-black text-xl text-slate-800 tracking-tight">Financial Performance Matrix (6M)</h4>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expenses</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-96 min-h-[400px]">
                        {financialLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-slate-100 border-t-secondary rounded-full animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <BarChart data={financialStats.chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `Rs. ${v/1000}k`} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        formatter={(v) => [`Rs. ${v.toLocaleString()}`, '']}
                                    />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="glass-card p-10 bg-white border border-slate-100 shadow-2xl">
                        <h4 className="font-black text-xl text-slate-800 mb-8 uppercase tracking-tight">Institutional Asset Distribution</h4>
                        <div className="h-72">
                            {financialLoading ? (
                                <div className="h-full flex items-center justify-center animate-pulse bg-slate-50 rounded-3xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Realized Revenue', value: financialStats.totalRevenue || 0 },
                                                { name: 'Pending Pipeline', value: financialStats.totalPending || 0 }
                                            ]}
                                            cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-10 bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-2xl">
                        <h4 className="font-black text-xl text-slate-800 mb-8 uppercase tracking-tight">Core Financial Matrix</h4>
                        <div className="space-y-6">
                            {[
                                { label: 'Net Operating Profit', value: financialStats.netProfit, color: 'text-emerald-600' },
                                { label: 'Monthly Burn Rate', value: financialStats.totalExpenses, color: 'text-rose-500' },
                                { label: 'Total Accounts Receivable', value: financialStats.totalPending, color: 'text-amber-600' }
                            ].map((stat) => (
                                <div key={stat.label} className="flex justify-between items-center py-4 border-b border-slate-200 last:border-0 hover:translate-x-2 transition-transform cursor-default group">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{stat.label}</span>
                                    <span className={cn("text-xl font-black italic", stat.color)}>Rs. {stat.value?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Enroll Modal */}
            <AnimatePresence>
                {showRegModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
                        <div className="min-h-screen py-20 w-full flex items-center justify-center">
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="w-full max-w-5xl relative">
                                <button onClick={() => setShowRegModal(false)} className="absolute -top-16 right-0 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 px-8 py-4 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 transition-all shadow-2xl">
                                    Exit System Protocol
                                </button>
                                <RegistrationForm onSuccess={() => { setShowRegModal(false); fetchFinancialStats(); fetchRecoveryAlerts(); }} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
