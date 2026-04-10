import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Mic, Bell, Command, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const Layout = ({ children }) => {
    const [command, setCommand] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { students, updatePayment, notification: globalNotification, showNotification: globalShowNotification, user } = useApp();

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            processCommand(command);
            setCommand('');
        }
    };

    const processCommand = (cmd) => {
        const text = cmd.toLowerCase();

        // Command 1: Update [Name]'s fee for the [N] installment
        const matchInst = text.match(/update ([\w\s]+)'s fee for the (\d+)(st|nd|rd|th) installment/);

        // Command 2: [Name] fee paid [Amount]
        const matchPaid = text.match(/([\w\s]+) fee paid (\d+)/);

        if (matchInst) {
            const name = matchInst[1].trim();
            const installmentNum = parseInt(matchInst[2]);
            const student = students.find(s => s.name.toLowerCase().includes(name));
            if (student) {
                updatePayment(student._id || student.id, installmentNum);
                globalShowNotification(`Success: ${student.name}'s installment ${installmentNum} marked as paid!`);
                return;
            }
        }

        if (matchPaid) {
            const name = matchPaid[1].trim();
            const amount = parseInt(matchPaid[2]);
            const student = students.find(s => s.name.toLowerCase().includes(name));
            if (student) {
                // Find first pending installment and pay it
                const nextPending = student.payments.find(p => p.status === 'Pending');
                if (nextPending) {
                    updatePayment(student._id || student.id, nextPending.installmentNumber);
                    globalShowNotification(`AI Update: Accepted Rs.${amount} for ${student.name}. Next pending installment marked paid.`);
                } else {
                    globalShowNotification(`Info: ${student.name} has no pending installments.`, 'warning');
                }
                return;
            }
        }

        globalShowNotification('Action failed. Try: "Zain Ali fee paid 5000"', 'error');
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile Floating Menu Button - Fixed positioning to avoid overlap */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-40 p-3 bg-primary text-white rounded-2xl shadow-2xl lg:hidden hover:scale-105 transition-transform active:scale-95"
            >
                <Menu size={24} />
            </button>

            <main className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                sidebarOpen ? "ml-0 lg:ml-72" : "ml-0 lg:ml-72",
                "p-4 sm:p-6 md:p-8 pt-20 sm:pt-8" // Responsive padding with top spacing for mobile
            )}>
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="relative w-full sm:w-1/2 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 group-focus-within:text-secondary transition-colors">
                            <Command size={18} />
                            <div className="w-[1px] h-4 bg-slate-200" />
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. 'Zain Ali fee paid 5000' or 'Update 2nd installment...'"
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-12 shadow-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-slate-600 font-bold"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            onKeyDown={handleCommand}
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors">
                            <Mic size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <button className="relative w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-secondary transition-all shadow-sm flex-shrink-0">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em]">{user?.role || 'Session Active'}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-white text-xs shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {globalNotification && (
                    <div className={cn(
                        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 flex items-center gap-3 sm:gap-4 font-bold bg-white border-l-[6px] max-w-xs sm:max-w-sm w-[90vw]",
                        globalNotification.type === 'success' && 'border-secondary text-slate-800',
                        globalNotification.type === 'error' && 'border-rose-500 text-rose-800',
                        globalNotification.type === 'warning' && 'border-amber-500 text-amber-500'
                    )}>
                        <div className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm sm:text-base",
                            globalNotification.type === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-rose-100 text-rose-500'
                        )}>
                            {globalNotification.type === 'success' ? '✓' : '!'}
                        </div>
                        <div className="pr-2 sm:pr-4 flex-1">
                            <p className="text-[10px] sm:text-xs opacity-50 uppercase tracking-widest">{globalNotification.type}</p>
                            <p className="text-xs sm:text-sm truncate">{globalNotification.message}</p>
                        </div>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
};

export default Layout;