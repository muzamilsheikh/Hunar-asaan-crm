import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, Sparkles, GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useApp();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Login attempt with:', credentials); // Debug log
        
        try {
            const result = await login(credentials.email, credentials.password);
            console.log('Login result:', result); // Debug log
            
            if (result.success && result.user) {
                console.log('Navigating to dashboard for role:', result.user.role); // Debug log
                if (result.user.role === 'Admin' || result.user.role === 'Staff') {
                    navigate('/'); // Admin/Staff go to main dashboard
                } else {
                    navigate('/'); // For now, all users go to main dashboard
                    // TODO: Add a proper student portal route later
                }
            } else {
                console.log('Login unsuccessful or no user returned'); // Debug log
                toast.error('Login failed: Invalid response');
            }
        } catch (error) {
            console.error('Login error caught:', error); // Debug log
            toast.error('Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-12 bg-white flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mb-8 border border-white/20">
                        <GraduationCap className="text-secondary" size={40} />
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Hunar Asaan CRM</h1>
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-secondary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Secure Access Management</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Identifier</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="input-field pl-12 bg-slate-50 border-slate-100 focus:bg-white"
                                    placeholder="admin@hunar.com"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="password"
                                    className="input-field pl-12 bg-slate-50 border-slate-100 focus:bg-white"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-secondary w-full py-5 flex items-center justify-center gap-3 active:scale-95 transition-all text-base tracking-tight font-black"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Establish Session</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 w-full text-center">
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic flex items-center justify-center gap-2">
                            <Sparkles size={12} className="text-secondary/40" />
                            Controlled Educational Interface v2026
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
