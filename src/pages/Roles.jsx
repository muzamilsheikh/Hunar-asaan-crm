import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserPlus, Mail, Lock, User, Key, Trash2, ArrowRight, Shield, BadgeCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Roles = () => {
    const { registerUser, showNotification } = useApp();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await registerUser(formData);
        if (success) {
            setFormData({ name: '', email: '', password: '', role: 'Staff' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-secondary animate-pulse" />
                        <span className="text-xs font-black text-secondary uppercase tracking-[0.4em]">Administrative Vault</span>
                    </div>
                    <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Access Control</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="glass-card p-10 bg-white border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg"><UserPlus size={24} /></div>
                                PROVISION NEW ACCOUNT
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="text"
                                            className="input-field pl-12 bg-slate-50 focus:bg-white border-slate-100"
                                            placeholder="John Staff"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="email"
                                            className="input-field pl-12 bg-slate-50 focus:bg-white border-slate-100"
                                            placeholder="john@hunar.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporary Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="password"
                                            className="input-field pl-12 bg-slate-50 focus:bg-white border-slate-100"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Privilege Tier</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <select
                                            className="input-field pl-12 bg-slate-50 focus:bg-white border-slate-100 font-bold"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="Staff">Limited (Staff)</option>
                                            <option value="Admin">Full (Admin)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-secondary w-full py-5 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-secondary/30 mt-4"
                                >
                                    {loading ? 'SYNCING...' : 'AUTHORIZE ACCOUNT'}
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-12 bg-primary text-white relative overflow-hidden h-full flex flex-col justify-between shadow-[0_50px_100px_-20px_rgba(30,58,138,0.3)]">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl opacity-50" />
                        <Shield className="absolute -right-10 -bottom-10 text-white/5 opacity-10" size={300} />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-8 tracking-tighter italic">Permission Matrix</h3>

                            <div className="space-y-6">
                                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg"><BadgeCheck size={24} /></div>
                                        <p className="font-black text-lg tracking-tight uppercase">Admin Tier</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {['Modify Master Revenue', 'Access Global Settings', 'Override Scholar Ledger', 'Provision Accounts', 'Finalize Expenses'].map((p, i) => (
                                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/60">
                                                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md opacity-60">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><User size={24} /></div>
                                        <p className="font-black text-lg tracking-tight uppercase">Staff Tier</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {['Scholar Registration', 'View Academic Lists', 'Basic Ledger View', 'Digital Vouchers'].map((p, i) => (
                                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/40">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-10 mt-10 border-t border-white/10 flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">System Logic v2.4</p>
                            <Sparkles className="text-secondary/40 animate-pulse" size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roles;
