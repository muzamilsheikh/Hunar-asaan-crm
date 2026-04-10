import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
    FileText, Download, Calendar, DollarSign, TrendingUp, Users, 
    ArrowUpRight, ArrowDownRight, Wallet, Filter, X, CheckCircle,
    Clock, BarChart3, PieChart, Activity
} from 'lucide-react';
import apiClient from '../utils/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const Reports = () => {
   const {financialStats, batches } = useApp();
   const [reportType, setReportType] = useState('monthly'); // monthly, yearly, custom
   const [selectedBatchId, setSelectedBatchId] = useState('all');
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
   const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
   const [generatingReport, setGeneratingReport] = useState(false);
   const [reportData, setReportData] = useState(null);

   const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

   const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

   const handleGenerateReport = async () => {
       setGeneratingReport(true);
        try {
            let startDate, endDate;

           if (reportType === 'monthly') {
                startDate = new Date(selectedYear, selectedMonth, 1);
                endDate = new Date(selectedYear, selectedMonth + 1, 0);
            } else if (reportType === 'yearly') {
                startDate = new Date(selectedYear, 0, 1);
                endDate = new Date(selectedYear, 11, 31);
            } else {
                startDate = new Date(customDateRange.startDate);
                endDate = new Date(customDateRange.endDate);
            }

            // Fetch data from API
           const response = await apiClient.getReports(startDate.toISOString(), endDate.toISOString(), selectedBatchId);
            
           if (response.success) {
               const batchObj = selectedBatchId === 'all' 
                   ? null 
                   : batches?.find(b => b.id.toString() === selectedBatchId.toString());

               setReportData({
                    ...response.data,
                    period: {
                        startDate,
                        endDate,
                        type: reportType,
                        batchName: batchObj ? batchObj.name : 'All Batches'
                    }
                });
            }
        } catch (error) {
           console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
           setGeneratingReport(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!reportData) return;

        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = pdf.internal.pageSize.getWidth();   // 210mm
            const LINE = 7;   // standard line height mm
            let y = 15;       // current Y cursor

            const fmt = (v) => `Rs. ${new Intl.NumberFormat('en-PK').format(v || 0)}`;

            const periodLabel = reportData.period?.type === 'monthly'
                ? `${months[selectedMonth]} ${selectedYear}`
                : reportData.period?.type === 'yearly'
                    ? `Year ${selectedYear}`
                    : `${reportData.period?.startDate} to ${reportData.period?.endDate}`;

            const batchLabel = reportData.period?.batchName && reportData.period.batchName !== 'All Batches'
                ? ` | ${reportData.period.batchName}` : '';

            // ── Gradient-style header band ──
            pdf.setFillColor(99, 102, 241);   // indigo-500
            pdf.rect(0, 0, W, 28, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text('Hunar Asaan CRM — Financial Report', 14, 12);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${periodLabel}${batchLabel}`, 14, 20);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, W - 14, 20, { align: 'right' });

            y = 36;

            // ── Summary Metrics (4 boxes) ──
            const metrics = [
                { label: 'Total Revenue',       value: reportData.totalRevenue,   r: 39,  g: 174, b: 96  },
                { label: 'Total Expenses',      value: reportData.totalExpenses,  r: 231, g: 76,  b: 60  },
                { label: 'Net Profit / Loss',   value: reportData.netProfit,      r: (reportData.netProfit >= 0 ? 39 : 231), g: (reportData.netProfit >= 0 ? 174 : 76), b: (reportData.netProfit >= 0 ? 96 : 60) },
                { label: 'Gross Business Value',value: (reportData.totalRevenue||0)+(reportData.totalPending||0), r: 99, g: 102, b: 241 }
            ];

            const boxW = (W - 28) / 4;   // 4 boxes with 14mm side margins + 4 gaps
            metrics.forEach((m, i) => {
                const x = 14 + i * (boxW + 4);
                pdf.setFillColor(248, 248, 252);
                pdf.roundedRect(x, y, boxW, 22, 3, 3, 'F');
                pdf.setDrawColor(m.r, m.g, m.b);
                pdf.setLineWidth(0.6);
                pdf.roundedRect(x, y, boxW, 22, 3, 3, 'S');

                pdf.setTextColor(m.r, m.g, m.b);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7);
                pdf.text(m.label.toUpperCase(), x + boxW / 2, y + 7, { align: 'center' });

                pdf.setFontSize(9);
                pdf.text(fmt(m.value), x + boxW / 2, y + 16, { align: 'center' });
            });

            y += 30;

            // ── Detailed Financial Summary ──
            pdf.setTextColor(30, 30, 30);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('Detailed Financial Summary', 14, y);
            y += 4;

            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);
            pdf.line(14, y, W - 14, y);
            y += 5;

            const summaryRows = [
                { label: 'Total Revenue (Collected)', value: reportData.totalRevenue,   color: [39, 174, 96]  },
                { label: 'Total Expenses',            value: reportData.totalExpenses,  color: [231, 76, 60]  },
                { label: 'Net Profit / Loss',         value: reportData.netProfit,      color: reportData.netProfit >= 0 ? [39, 174, 96] : [231, 76, 60] },
                { label: 'Pending Fees (Outstanding)',value: reportData.totalPending,   color: [217, 119, 6]  },
            ];

            summaryRows.forEach((row) => {
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(60, 60, 60);
                pdf.text(row.label, 16, y);

                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...row.color);
                pdf.text(fmt(row.value), W - 14, y, { align: 'right' });

                pdf.setDrawColor(240, 240, 240);
                pdf.setLineWidth(0.2);
                y += 1.5;
                pdf.line(14, y, W - 14, y);
                y += LINE - 1.5;
            });

            // Total Business Value highlight row
            const grossVal = (reportData.totalRevenue || 0) + (reportData.totalPending || 0);
            pdf.setFillColor(238, 242, 255);
            pdf.roundedRect(14, y - 2, W - 28, 10, 2, 2, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(99, 102, 241);
            pdf.text('TOTAL BUSINESS VALUE', 16, y + 5);
            pdf.text(fmt(grossVal), W - 14, y + 5, { align: 'right' });
            y += 18;

            // ── Student Transactions Table ──
            if (reportData.students && reportData.students.length > 0) {
                // Check if we need a new page
                if (y > 220) { pdf.addPage(); y = 15; }

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(30, 30, 30);
                pdf.text(`Student Transactions (${reportData.students.length})`, 14, y);
                y += 4;

                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.3);
                pdf.line(14, y, W - 14, y);
                y += 5;

                // Table header
                const cols = [14, 65, 120, 150, 175];
                const headers = ['Student', 'Course', 'Total Fee', 'Paid', 'Pending'];
                pdf.setFillColor(99, 102, 241);
                pdf.rect(14, y - 4, W - 28, 8, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                headers.forEach((h, i) => {
                    const align = i >= 2 ? 'right' : 'left';
                    const x = i >= 2 ? cols[i] + 20 : cols[i];
                    pdf.text(h, x, y + 1, { align });
                });
                y += 7;

                // Table rows
                reportData.students.forEach((s, idx) => {
                    if (y > 270) { pdf.addPage(); y = 15; }

                    if (idx % 2 === 0) {
                        pdf.setFillColor(248, 249, 255);
                        pdf.rect(14, y - 4, W - 28, 7, 'F');
                    }

                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8);
                    pdf.setTextColor(30, 30, 30);
                    pdf.text(String(s.name || '').substring(0, 22), cols[0], y);

                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(80, 80, 80);
                    pdf.text(String(s.course || '').substring(0, 20), cols[1], y);

                    pdf.setTextColor(30, 30, 30);
                    pdf.text(fmt(s.totalFee), cols[2] + 20, y, { align: 'right' });

                    pdf.setTextColor(39, 174, 96);
                    pdf.text(fmt(s.paid), cols[3] + 20, y, { align: 'right' });

                    pdf.setTextColor(231, 76, 60);
                    pdf.text(fmt(s.pending), cols[4] + 20, y, { align: 'right' });

                    y += LINE;
                });
            }

            // ── Footer on each page ──
            const totalPages = pdf.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                pdf.setPage(p);
                pdf.setFontSize(8);
                pdf.setTextColor(160, 160, 160);
                pdf.setFont('helvetica', 'italic');
                pdf.text('Hunar Asaan CRM — Confidential Financial Report', 14, 290);
                pdf.text(`Page ${p} of ${totalPages}`, W - 14, 290, { align: 'right' });
            }

            // ── Save ──
            const batchSuffix = reportData.period?.batchName && reportData.period.batchName !== 'All Batches'
                ? `_${reportData.period.batchName.replace(/\s+/g, '_')}` : '';
            const filePeriod = reportData.period?.type === 'monthly'
                ? `${months[selectedMonth]}_${selectedYear}`
                : reportData.period?.type === 'yearly'
                    ? `Year_${selectedYear}`
                    : `${reportData.period?.startDate}_to_${reportData.period?.endDate}`;

            pdf.save(`Financial_Report_${filePeriod}${batchSuffix}.pdf`);
            console.log('✅ PDF saved successfully');

        } catch (error) {
            console.error('❌ PDF generation failed:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        
        // 1. Summary Sheet (Matching Prompt)
        const summaryData = [
            ["Description", "Amount (Rs.)"],
            ["Total Revenue", reportData.totalRevenue || 0],
            ["Total Expenses", reportData.totalExpenses || 0],
            ["Net Profit", reportData.netProfit || 0],
            ["Pending Fees", reportData.totalPending || 0]
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        // 2. Students Sheet
        const studentsData = reportData.students ? reportData.students.map(s => ({
            "Student Name": s.name || '',
            "Student ID": s.code || '',
            "Course": s.course || '',
            "Total Fee": s.totalFee || 0,
            "Paid": s.paid || 0,
            "Pending": s.pending || 0
        })) : [];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        
        if (studentsData.length > 0) {
            const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
            XLSX.utils.book_append_sheet(wb, studentsSheet, "Student Details");
        }

        XLSX.writeFile(wb, `Financial_Report_${reportData.period.startDate}_to_${reportData.period.endDate}.xlsx`);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PK').format(value || 0);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financial Reports</h2>
                    <p className="text-slate-400 mt-1 font-medium">Generate comprehensive accounts reports in PDF format.</p>
                </div>
            </div>

            {/* Report Configuration Card */}
            <div className="glass-card p-6 bg-white border border-slate-100 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Filter size={20} className="text-secondary" />
                    <h3 className="text-lg font-black text-slate-800">Report Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Report Type Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Report Type</label>
                        <select 
                            value={reportType} 
                            onChange={(e) => setReportType(e.target.value)}
                            className="input-field"
                        >
                            <option value="monthly">Monthly Report</option>
                            <option value="yearly">Yearly Report</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {/* Batch Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Batch</label>
                        <select 
                            value={selectedBatchId} 
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Batches</option>
                            {batches?.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Month Selection */}
                    {reportType === 'monthly' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Month</label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="input-field"
                                >
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Year</label>
                                <select 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="input-field"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Year Selection */}
                    {reportType === 'yearly' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Year</label>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="input-field"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Custom Date Range */}
                    {reportType === 'custom' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Start Date</label>
                                <input 
                                    type="date" 
                                    value={customDateRange.startDate}
                                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">End Date</label>
                                <input 
                                    type="date" 
                                    value={customDateRange.endDate}
                                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                        className="btn-secondary flex items-center gap-2 px-6"
                    >
                        {generatingReport ? (
                            <>
                                <Clock size={18} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <BarChart3 size={18} />
                                Generate Report
                            </>
                        )}
                    </button>

                    {reportData && (
                        <>
                            <button 
                                onClick={handleDownloadPDF}
                                className="btn-primary flex items-center gap-2 px-6"
                            >
                                <Download size={18} />
                                Download PDF
                            </button>
                            <button 
                                onClick={handleExportExcel}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black uppercase transition-all shadow-md"
                            >
                                <Download size={18} />
                                Export Excel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Report Preview */}
            {reportData && (
                <motion.div 
                    id="report-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-slate-50 p-2 sm:p-4 rounded-xl"
                >
                    {/* Report Header */}
                    <div className="glass-card p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">
                                    {reportType === 'monthly' && `${months[selectedMonth]} ${selectedYear}`}
                                    {reportType === 'yearly' && `Year ${selectedYear}`}
                                    {reportType === 'custom' && 'Custom Period'}
                                    {reportData.period?.batchName && reportData.period.batchName !== 'All Batches' && ` - ${reportData.period.batchName}`}
                                </h3>
                                <p className="text-white/80 text-sm mt-1 font-medium">
                                    {reportData.period?.startDate?.toLocaleDateString()} - {reportData.period?.endDate?.toLocaleDateString()}
                                </p>
                            </div>
                            <FileText size={48} className="text-white/20" />
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard 
                            title="Total Revenue" 
                            value={`Rs. ${formatCurrency(reportData.totalRevenue)}`}
                            icon={DollarSign}
                           color="emerald"
                        />
                        <MetricCard 
                            title="Total Expenses" 
                            value={`Rs. ${formatCurrency(reportData.totalExpenses)}`}
                            icon={Wallet}
                           color="rose"
                        />
                        <MetricCard 
                            title="Net Profit/Loss" 
                            value={`Rs. ${formatCurrency(reportData.netProfit)}`}
                            icon={TrendingUp}
                           color={reportData.netProfit >= 0 ? 'emerald' : 'rose'}
                        />
                        <MetricCard 
                            title="Gross Business Value" 
                            value={`Rs. ${formatCurrency((reportData.totalRevenue || 0) + (reportData.totalPending || 0))}`}
                            icon={Activity}
                           color="indigo"
                        />
                    </div>

                    {/* Detailed Summary Table */}
                    <div className="glass-card p-6 bg-white border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <PieChart size={20} className="text-secondary" />
                            <h3 className="text-lg font-black text-slate-800">Detailed Financial Summary</h3>
                        </div>

                        <div className="space-y-3">
                            <SummaryRow label="Total Revenue (Collected)" value={reportData.totalRevenue} highlight />
                            <SummaryRow label="Total Expenses" value={reportData.totalExpenses} negative />
                            <SummaryRow label="Net Profit/Loss" value={reportData.netProfit} profit={reportData.netProfit >= 0} />
                            <SummaryRow label="Pending Fees (Outstanding)" value={reportData.totalPending} warning />
                            
                            <div className="mt-6 pt-6 border-t-2 border-slate-200">
                                <SummaryRow 
                                    label="TOTAL BUSINESS VALUE" 
                                    value={(reportData.totalRevenue || 0) + (reportData.totalPending || 0)}
                                    bold
                                    gradient
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Transactions */}
                    {reportData.students && reportData.students.length > 0 && (
                        <div className="glass-card p-6 bg-white border border-slate-100 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Users size={20} className="text-secondary" />
                                <h3 className="text-lg font-black text-slate-800">Student Transactions ({reportData.students.length})</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Course</th>
                                            <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Fee</th>
                                            <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Paid</th>
                                            <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.students.map((student, index) => (
                                            <tr key={student.id || index} className="border-b border-slate-50 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{student.name}</p>
                                                        <p className="text-[10px] text-slate-400">{student.code}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600">{student.course}</td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-800">Rs. {new Intl.NumberFormat('en-PK').format(student.totalFee || 0)}</td>
                                                <td className="py-3 px-4 text-right font-bold text-emerald-600">Rs. {new Intl.NumberFormat('en-PK').format(student.paid || 0)}</td>
                                                <td className="py-3 px-4 text-right font-bold text-rose-600">Rs. {new Intl.NumberFormat('en-PK').format(student.pending || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {!reportData && !generatingReport && (
                <div className="text-center py-20">
                    <FileText size={64} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">No Report Generated Yet</p>
                    <p className="text-slate-400 mt-2">Select a date range and click "Generate Report" to view financial data</p>
                </div>
            )}
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color }) => {
   const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };

    return (
        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{title}</p>
            <p className="text-2xl font-black text-slate-800">{value}</p>
        </motion.div>
    );
};

// Summary Row Component
const SummaryRow = ({ label, value, highlight, negative, profit, warning, bold, gradient }) => {
    let valueClass = 'font-bold text-slate-800';
   if (highlight) valueClass = 'font-black text-secondary text-lg';
   if (negative) valueClass = 'font-bold text-rose-600';
   if (profit) valueClass = 'font-bold text-emerald-600';
   if (warning) valueClass = 'font-bold text-amber-600';
   if (bold) valueClass = 'font-black text-2xl';
   if (gradient) valueClass = 'font-black text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent';

   const formattedValue = new Intl.NumberFormat('en-PK').format(value || 0);

    return (
        <div className={`flex justify-between items-center py-3 ${bold ? 'px-4 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200' : 'border-b border-slate-100'}`}>
            <span className={`${bold ? 'text-[10px] font-black text-indigo-600 uppercase tracking-widest' : 'text-slate-600'}`}>{label}</span>
            <span className={valueClass}>Rs. {formattedValue}</span>
        </div>
    );
};

export default Reports;
