import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Wallet, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, AlertCircle, X, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {
    const { expenses, addExpense, deleteExpense, getStats, refreshFinancialStats } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'Marketing',
        date: new Date().toISOString().split('T')[0]
    });

    const stats = getStats();

    const filteredExpenses = expenses.filter(e =>
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await addExpense({ ...newExpense, amount: parseInt(newExpense.amount) });
        if (success) {
            await refreshFinancialStats(); // Refresh financial stats after adding expense
        }
        setShowModal(false);
        setNewExpense({ description: '', amount: '', category: 'Marketing', date: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Financial Tracker</h2>
                    <p className="text-slate-400 mt-1 font-medium">Log daily operational costs and monitor burn rate.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-secondary flex items-center gap-2">
                    <Plus size={20} /> Log Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 bg-white border-l-8 border-rose-500 shadow-xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Monthly Burn</p>
                    <h4 className="text-3xl font-black text-slate-800">Rs. {stats.monthlyExpenses.toLocaleString()}</h4>
                    <div className="mt-4 flex items-center gap-2 text-rose-500 font-bold text-xs uppercase">
                        <ArrowDownRight size={14} /> Tracking All Logs
                    </div>
                </div>
                <div className="glass-card p-8 bg-slate-900 text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-1">Active Ledger</p>
                    <h4 className="text-3xl font-black">{expenses.length} Entries</h4>
                    <p className="mt-4 text-white/60 font-medium text-xs">Total volume recorded</p>
                </div>
                <div className="glass-card p-8 bg-secondary text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-1">Status</p>
                    <h4 className="text-3xl font-black tracking-tight">Production</h4>
                    <p className="mt-4 text-white/60 font-medium text-xs uppercase tracking-widest">Live Sync Active</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search descriptions or categories..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl focus:bg-white border-transparent focus:ring-2 focus:ring-secondary/10 outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 border-l border-slate-100">
                    <Filter size={18} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Journal</span>
                </div>
            </div>

            <div className="glass-card bg-white shadow-xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5 text-left">Date</th>
                                <th className="px-8 py-5 text-left">Description</th>
                                <th className="px-8 py-5 text-left">Category</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense._id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5 flex items-center gap-2 text-slate-400 font-bold text-sm">
                                        <Calendar size={14} /> {expense.date}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-800 text-sm">{expense.description}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-rose-500">
                                        - Rs. {expense.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={async () => {
                                                const success = await deleteExpense(expense._id);
                                                if (success) {
                                                    await refreshFinancialStats(); // Refresh financial stats after deleting expense
                                                }
                                            }} 
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr key="no-expenses"><td colSpan="5" className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Log Operation Cost</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Updates financial stats live</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entry Date</label>
                                    <input type="date" className="input-field" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                                    <input placeholder="e.g. Fiber Internet Bill" className="input-field" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
                                        <select className="input-field bg-white" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                                            <option>Marketing</option>
                                            <option>Utilities</option>
                                            <option>Rent</option>
                                            <option>Salaries</option>
                                            <option>Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount (Rs.)</label>
                                        <input type="number" placeholder="5000" className="input-field" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn-secondary w-full py-4 text-base font-black tracking-tight mt-4 uppercase">
                                    Confirm Log Entry
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Expenses;
