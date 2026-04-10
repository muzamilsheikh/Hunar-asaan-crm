import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
   LayoutDashboard, Users, GraduationCap, Wallet,
    Settings, ShieldAlert, Sparkles, LogOut, Layers, ShieldCheck, Video, MessageCircle, X, Menu, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { settings, logout, user } = useApp();

    const navLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['Admin', 'Staff', 'Student'] },
        { name: 'Students', icon: Users, path: '/students', roles: ['Admin', 'Staff'] },
        { name: 'Users', icon: ShieldCheck, path: '/users', roles: ['Admin'] },
        { name: 'Batches', icon: Layers, path: '/batches', roles: ['Admin', 'Staff'] },
        { name: 'Courses', icon: GraduationCap, path: '/courses', roles: ['Admin'] },
        { name: 'Expenses', icon: Wallet, path: '/expenses', roles: ['Admin'] },
        { name: 'Reports', icon: FileText, path: '/reports', roles: ['Admin', 'Staff'] },
        { name: 'Roles', icon: ShieldCheck, path: '/roles', roles: ['Admin'] },
        { name: 'Live Class', icon: Video, path: '/live-class', roles: ['Admin', 'Staff', 'Student'] },
        { name: 'Chat', icon: MessageCircle, path: '/chat', roles: ['Admin', 'Staff', 'Student'] },
        { name: 'Settings', icon: Settings, path: '/settings', roles: ['Admin'] },
    ].filter(link => link.roles.includes(user?.role));

    // Close sidebar when clicking outside (for mobile)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={handleOverlayClick}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-72 h-screen bg-primary fixed left-0 top-0 text-white flex flex-col z-50 overflow-hidden transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Mobile Header with Close Button */}
                <div className="p-4 border-b border-white/10 lg:hidden flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                            {settings?.logoUrl ? (
                                <img 
                                    src={`http://localhost:5001${settings.logoUrl}`} 
                                    alt="Logo" 
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                        console.error('Logo failed to load:', e.target.src);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <GraduationCap className="text-secondary" size={20} />
                            )}
                        </div>
                        <span className="font-black text-sm">MENU</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Desktop Header */}
                <div className="p-10 relative overflow-hidden hidden lg:block">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            {settings?.logoUrl ? (
                                <img 
                                    src={`http://localhost:5001${settings.logoUrl}`} 
                                    alt="Logo" 
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                        console.error('Logo failed to load:', e.target.src);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <GraduationCap className="text-secondary" size={28} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter leading-tight italic">
                                {settings?.instituteName?.split(' ')[0] || 'HUNAR'} <br />
                                <span className="text-secondary not-italic">{settings?.instituteName?.split(' ').slice(1).join(' ') || 'ASAAN'}</span>
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Active System</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Orbit */}
                <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
                    <p className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 hidden lg:block">Master Control</p>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-white/10 text-white shadow-xl border border-white/10'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <link.icon size={20} className={cn(isActive && 'text-secondary')} />
                                    <span className="font-black text-xs uppercase tracking-widest">{link.name}</span>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                                        <Sparkles size={12} className="text-secondary/40" />
                                    </div>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Exit */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-3xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-primary text-xs shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-xs truncate uppercase tracking-tighter">{user?.name || 'User Session'}</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">{user?.role || 'Guest'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-black text-xs uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Exit Portal</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;