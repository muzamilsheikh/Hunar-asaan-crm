import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Users, Layers, Clock, Plus, Search, Trash2, Edit3, Filter, ArrowRight, X, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Batches = () => {
    const { batches, courses, students, addBatch, deleteBatch } = useApp();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBatch, setNewBatch] = useState({ name: '', time: '', courseId: '' });

    const filteredBatches = batches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newBatch.courseId) return alert('Select a course');
        // Convert courseId to integer (Sequelize expects integer, not string)
        const batchData = {
            ...newBatch,
            courseId: parseInt(newBatch.courseId) || null
        };
        await addBatch(batchData);
        setShowModal(false);
        setNewBatch({ name: '', time: '', courseId: '' });
    };

    const handleSeeStudents = (batchId) => {
        navigate('/students', { state: { batchId } });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Batch Management</h2>
                    <p className="text-slate-400 mt-1 font-medium">Coordinate timing groups and monitor enrollment.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-secondary flex items-center gap-2">
                    <Plus size={20} /> Create New Batch
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search batches..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl focus:bg-white border-transparent outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBatches.map((batch) => {
                    const batchCourseId = batch.courseId?.id || batch.courseId?._id || batch.courseId;
                    const course = courses.find(c => (c.id === batchCourseId || c._id === batchCourseId));
                    const batchId = batch.id || batch._id;
                    const batchStudents = students.filter(s => {
                        const sBatchId = s.batchId?.id || s.batchId?._id || s.batchId;
                        return sBatchId === batchId;
                    });

                    return (
                        <motion.div key={batch.id || batch._id} whileHover={{ y: -5 }} className="glass-card group border-l-8 border-l-secondary bg-white shadow-lg overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-secondary/5 text-secondary rounded-2xl flex items-center justify-center border border-secondary/10">
                                        <Layers size={28} />
                                    </div>
                                    <button onClick={() => deleteBatch(batch.id || batch._id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{course?.name || 'Assigned Course'}</p>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{batch.name}</h3>
                                </div>

                                <div className="flex items-center gap-3 text-slate-600 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
                                    <Clock size={16} className="text-secondary" />
                                    <span className="text-sm">{batch.time}</span>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <button
                                        onClick={() => handleSeeStudents(batch.id || batch._id)}
                                        className="flex items-center gap-2 text-sm font-black text-secondary hover:text-secondary-dark group"
                                    >
                                        See Students <span className="px-2 py-0.5 bg-secondary/10 rounded-full text-[10px]">{batchStudents.length}</span>
                                    </button>
                                    <div className="flex -space-x-2">
                                        {batchStudents.slice(0, 3).map((s, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                                {s.name.charAt(0)}
                                            </div>
                                        ))}
                                        {batchStudents.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                +{batchStudents.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                            <div className="mb-8 text-center">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Create Timing Slot</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Deploy a new course batch</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Batch Identifier</label>
                                    <input required className="input-field" placeholder="e.g. Morning A" value={newBatch.name} onChange={e => setNewBatch({ ...newBatch, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Associated Course</label>
                                    <select required className="input-field bg-white" value={newBatch.courseId} onChange={e => setNewBatch({ ...newBatch, courseId: e.target.value })}>
                                        <option value="">Select Catalog Course</option>
                                        {courses.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Training Hours</label>
                                    <input required className="input-field" placeholder="e.g. 09:00 - 11:00 AM" value={newBatch.time} onChange={e => setNewBatch({ ...newBatch, time: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-secondary w-full py-4 text-base font-black tracking-tight mt-4 uppercase shadow-xl shadow-secondary/20">
                                    Publish Batch Slot
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Batches;
