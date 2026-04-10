import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    BookOpen, Plus, Search, Edit3, Trash2, Users, Clock, Tag, X, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Courses = () => {
    const { courses, addCourse, updateCourse } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({ name: '', fee: '', duration: '', code: '' });

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({ name: course.name, fee: course.fee, duration: course.duration, code: course.code });
        } else {
            setEditingCourse(null);
            setFormData({ name: '', fee: '', duration: '', code: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...formData, fee: parseInt(formData.fee) };
        if (editingCourse) {
            await updateCourse(editingCourse._id, data);
        } else {
            await addCourse(data);
        }
        setShowModal(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Course Catalog</h2>
                    <p className="text-slate-400 mt-1 font-medium">Manage academic offerings and pricing strategies.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-secondary flex items-center gap-2">
                    <Plus size={20} /> Create New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses && courses.length > 0 ? (
                    courses.map((course) => (
                        <motion.div key={course.id} whileHover={{ y: -5 }} className="glass-card group bg-white border-t-8 border-t-secondary transition-all shadow-xl">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center border border-secondary/10">
                                        <BookOpen size={28} />
                                    </div>
                                    <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-300 hover:text-secondary hover:bg-secondary/5 rounded-lg">
                                        <Edit3 size={18} />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-black">{course.code}</span>
                                        <Sparkles size={12} className="text-secondary" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{course.name}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</span>
                                        </div>
                                        <span className="font-extrabold text-slate-800 text-sm">{course.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/10">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-secondary" />
                                            <span className="text-xs font-black text-secondary uppercase tracking-widest">Standard Fee</span>
                                        </div>
                                        <span className="font-black text-secondary text-lg">Rs. {course.fee.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Curriculum</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg">No courses available</p>
                        <p className="text-slate-400 mt-2">Create your first course to get started</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400">
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">
                                {editingCourse ? 'Modify Course' : 'Launch New Course'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Serial Code</label>
                                        <input placeholder="MB" className="input-field" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration</label>
                                        <input placeholder="3 Months" className="input-field" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Course Name</label>
                                    <input placeholder="Medical Billing..." className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tuition Fee (Rs.)</label>
                                    <input type="number" placeholder="30000" className="input-field" value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn-secondary w-full py-4 font-black mt-4 uppercase tracking-wider">
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Courses;
