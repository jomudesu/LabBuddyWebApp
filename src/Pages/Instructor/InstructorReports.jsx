import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Users, 
  FlaskConical, 
  FileText,
  Calendar,
  Search,
  BookOpen,
  LayoutGrid,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 
import { useAuth } from '../../backend/Firebase/AuthContext';

// Standard EARIST Grading System
const getEaristGrade = (percentage) => {
  if (percentage >= 97) return '1.00';
  if (percentage >= 94) return '1.25';
  if (percentage >= 91) return '1.50';
  if (percentage >= 88) return '1.75';
  if (percentage >= 85) return '2.00';
  if (percentage >= 82) return '2.25';
  if (percentage >= 79) return '2.50';
  if (percentage >= 76) return '2.75';
  if (percentage === 75) return '3.00';
  return '5.00'; 
};

const InstructorReports = () => {
  const { currentUser } = useAuth();
  const [activeReport, setActiveReport] = useState('gradebook');
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState('');

  // ─── DATA STATES ───
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [progress, setProgress] = useState([]);

  // ─── FILTER STATES ───
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');

  const sectionsString = JSON.stringify(currentUser?.handledSections || []);
  const instructorSections = useMemo(() => JSON.parse(sectionsString), [sectionsString]);

  // Reset module filter when switching tabs
  useEffect(() => {
    setSearchQuery('');
    if (activeReport !== 'module') setModuleFilter('All');
    setReportDate(new Date().toLocaleString());
  }, [activeReport]);

  // ─── FETCH SUPABASE DATA ───
  useEffect(() => {
    if (instructorSections.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [expRes, stuRes, progRes] = await Promise.all([
          supabase.from('experiments').select('*').eq('status', 'published'),
          supabase.from('users').select('*').eq('role', 'student').in('section', instructorSections),
          supabase.from('user_progress').select('*')
        ]);

        if (expRes.data) setExperiments(expRes.data.sort((a,b) => a.title.localeCompare(b.title)));
        if (stuRes.data) setStudents(stuRes.data.map(s => ({ ...s, displayName: s.display_name })).sort((a,b) => a.displayName.localeCompare(b.displayName)));
        if (progRes.data) setProgress(progRes.data.map(p => ({ 
          ...p, 
          userId: p.user_id, 
          experimentId: p.experiment_id,
          grade: p.grade,
          errors: p.errors 
        })));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
        setReportDate(new Date().toLocaleString());
      }
    };

    fetchData();
  }, [instructorSections]); // <--- Now fully stable and will not loop!

  // ─── BUILD GRADEBOOK ───
  const gradebook = useMemo(() => {
    return students.map(student => {
      const studentRecords = progress.filter(p => p.userId === student.id);
      const completions = {};
      let completedCount = 0;

      experiments.forEach(exp => {
        const record = studentRecords.find(p => p.experimentId === exp.id);
        if (record && record.status === 'completed') { 
          completions[exp.id] = { completed: true, grade: record.grade, errors: record.errors || 0 }; 
          completedCount++; 
        } else { 
          completions[exp.id] = { completed: false }; 
        }
      });

      const progressPercentage = experiments.length > 0 ? Math.round((completedCount / experiments.length) * 100) : 0;
      return { ...student, completions, completedCount, progressPercentage };
    });
  }, [students, experiments, progress]);

  // ─── APPLY FILTERS ───
  const processedData = useMemo(() => {
    return gradebook.filter(student => {
      const matchesSearch = (student.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (student.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [gradebook, searchQuery, sectionFilter]);

  const handlePrint = () => {
    window.print();
  };

  const reportTypes = [
    { id: 'gradebook', title: 'Master Gradebook', icon: BookOpen, color: 'purple' },
    { id: 'module', title: 'Module Performance', icon: FlaskConical, color: 'blue' },
    { id: 'roster', title: 'Class Roster', icon: Users, color: 'emerald' },
  ];

  if (!loading && instructorSections.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg border border-slate-200">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No Sections Assigned</h2>
          <p className="text-slate-500 mt-2">You need to be assigned to at least one section to generate reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-fade-in">
      
      {/* ─── PRINT CSS (Dynamically switches A4 orientation based on active tab) ─── */}
      <style>{`
        @page { size: A4 ${activeReport === 'gradebook' ? 'landscape' : 'portrait'}; margin: 15mm; }
        @media print {
          body * { visibility: hidden; }
          html, body, #root { position: static !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background-color: white !important; }
          #printable-document { display: block !important; visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 100% !important; background-color: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          #printable-document * { visibility: visible !important; }
          table { width: 100% !important; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; font-family: sans-serif; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border: 1px solid #cbd5e1 !important; padding: 10px 12px !important; text-align: left; color: black !important; font-size: 11px; }
          th { background-color: #f1f5f9 !important; font-weight: bold; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-header { border-bottom: 2px solid #6b21a8; padding-bottom: 10px; margin-bottom: 25px; font-family: sans-serif; }
          .section-heading { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; color: #334155 !important; font-family: sans-serif; background: #f8fafc; padding: 4px 8px; border-left: 4px solid #6b21a8; }
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            <Printer className="mr-3 text-purple-600" size={32} />
            Reports & Printing
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Generate official class records and gradebooks.</p>
        </div>
      </div>

      {/* ─── COMPACT REPORT SELECTION TABS ─── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        {reportTypes.map((report) => {
          const isActive = activeReport === report.id;
          return (
            <button 
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex-1 flex items-center p-3 rounded-xl transition-all duration-300 ${
                isActive ? `bg-slate-50 border border-slate-200 shadow-sm` : 'border border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 shrink-0 ${isActive ? `bg-${report.color}-100 text-${report.color}-600` : 'bg-slate-100 text-slate-400'}`}>
                <report.icon size={18} />
              </div>
              <div className="text-left">
                <h3 className={`text-sm font-bold ${isActive ? 'text-slate-800' : ''}`}>{report.title}</h3>
                {isActive && <p className={`text-[10px] font-medium text-${report.color}-500 mt-0.5 uppercase tracking-wider`}>Active Report</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── PREVIEW SECTION (Light Theme) ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col min-h-[400px]">
        
        {/* ─── PREVIEW HEADER & FILTERS ─── */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl shrink-0">
          
          <div className="flex items-center shrink-0">
            <FileText className="text-purple-500 mr-3" size={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {reportTypes.find(r => r.id === activeReport)?.title} Preview
              </h2>
              <p className="text-xs font-medium text-slate-500 flex items-center mt-0.5">
                <Calendar size={12} className="mr-1" /> Generated on {reportDate}
              </p>
            </div>
          </div>
          
          {/* Filters beside Print Button */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 justify-start 2xl:justify-end no-print">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search student..."
                className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-purple-500 w-36 lg:w-48 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <LayoutGrid size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={sectionFilter} 
                onChange={(e) => setSectionFilter(e.target.value)} 
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-purple-500 appearance-none"
              >
                <option value="All">All Sections</option>
                {instructorSections.map(s => <option key={s} value={s}>Section: {s}</option>)}
              </select>
            </div>

            {activeReport === 'module' && (
              <select 
                value={moduleFilter} 
                onChange={(e) => setModuleFilter(e.target.value)} 
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-purple-500 max-w-[200px] truncate"
              >
                <option value="All">Select a Module...</option>
                {experiments.map(exp => <option key={exp.id} value={exp.id}>{exp.title}</option>)}
              </select>
            )}

            <button 
              onClick={handlePrint}
              disabled={loading || processedData.length === 0 || (activeReport === 'module' && moduleFilter === 'All')}
              className="flex items-center justify-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-auto 2xl:ml-2"
            >
              <Printer size={16} className="mr-2" />
              Print PDF
            </button>
          </div>
        </div>

        <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
              <p className="font-medium tracking-wider uppercase text-xs">Compiling Report...</p>
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <Users size={40} className="mb-4 opacity-50" />
              <p className="font-bold text-lg text-slate-500">No students match your filters</p>
            </div>
          ) : activeReport === 'module' && moduleFilter === 'All' ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <FlaskConical size={40} className="mb-4 opacity-50" />
              <p className="font-bold text-lg text-slate-500">Please select a specific module above</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Section</th>
                    
                    {activeReport === 'roster' && (
                       <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Email Address</th>
                    )}
                    
                    {activeReport === 'gradebook' && (
                      <>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center bg-purple-50/50">Overall Progress</th>
                        {experiments.map(exp => (
                          <th key={exp.id} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center border-l border-slate-200 max-w-[150px] truncate" title={exp.title}>
                            {exp.title}
                          </th>
                        ))}
                      </>
                    )}

                    {activeReport === 'module' && (
                      <>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center border-l border-slate-200">Status</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center">Score (%)</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center">Errors</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center bg-purple-50/50">Grade</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-800 font-bold">{student.displayName}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{student.section}</td>
                      
                      {activeReport === 'roster' && (
                        <td className="px-5 py-3 text-sm text-slate-500">{student.email}</td>
                      )}

                      {activeReport === 'gradebook' && (
                        <>
                          <td className="px-5 py-3 text-sm font-bold text-center bg-purple-50/20 text-purple-700">
                            {student.progressPercentage}%
                          </td>
                          {experiments.map(exp => {
                            const details = student.completions[exp.id];
                            return (
                              <td key={exp.id} className="px-5 py-3 text-sm text-center border-l border-slate-100">
                                {details?.completed ? (
                                  <div className="flex flex-col items-center leading-tight">
                                    <span className={`font-bold ${details.grade >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {getEaristGrade(details.grade)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">({details.grade}%)</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}
                        </>
                      )}

                      {activeReport === 'module' && (
                        <>
                          {student.completions[moduleFilter]?.completed ? (
                            <>
                              <td className="px-5 py-3 text-sm text-center border-l border-slate-100 text-emerald-600 font-bold">Completed</td>
                              <td className="px-5 py-3 text-sm text-center font-medium text-slate-700">{student.completions[moduleFilter].grade}%</td>
                              <td className="px-5 py-3 text-sm text-center font-medium text-amber-600">{student.completions[moduleFilter].errors}</td>
                              <td className={`px-5 py-3 text-sm text-center font-black bg-purple-50/20 ${student.completions[moduleFilter].grade >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {getEaristGrade(student.completions[moduleFilter].grade)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3 text-sm text-center border-l border-slate-100 text-slate-400">Pending</td>
                              <td className="px-5 py-3 text-sm text-center text-slate-300">-</td>
                              <td className="px-5 py-3 text-sm text-center text-slate-300">-</td>
                              <td className="px-5 py-3 text-sm text-center bg-purple-50/20 text-slate-300">-</td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ─── HIDDEN PRINTABLE DOCUMENT (Only shows when printing) ─── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div id="printable-document" className="hidden print:block">
        <div className="print-header">
          <h1 style={{ margin: 0, fontSize: '26px', color: '#1e293b' }}>Lab Buddy - Instructor Portal</h1>
          <h2 style={{ margin: '6px 0', fontSize: '18px', color: '#6b21a8' }}>
            {reportTypes.find(r => r.id === activeReport)?.title}
            {activeReport === 'module' && moduleFilter !== 'All' && ` - ${experiments.find(e => e.id === moduleFilter)?.title}`}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Instructor: {currentUser?.displayName || currentUser?.email} | Generated on: {reportDate}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Filter Applied: {sectionFilter === 'All' ? 'All Handled Sections' : `Section ${sectionFilter}`}
          </p>
        </div>

        {/* Group students by Section for the printed report for better readability */}
        {['All', ...instructorSections].filter(sec => sectionFilter === 'All' ? sec !== 'All' : sec === sectionFilter).map(sectionName => {
          const sectionStudents = processedData.filter(s => s.section === sectionName);
          if (sectionStudents.length === 0) return null;

          return (
            <div key={sectionName} style={{ marginBottom: '30px' }}>
              <div className="section-heading">Section: {sectionName}</div>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    {activeReport === 'roster' && <th>Email Address</th>}
                    
                    {activeReport === 'gradebook' && (
                      <>
                        <th style={{ textAlign: 'center', backgroundColor: '#f3e8ff' }}>Progress</th>
                        {experiments.map(exp => (
                          <th key={exp.id} style={{ textAlign: 'center', fontSize: '10px' }}>{exp.title}</th>
                        ))}
                      </>
                    )}

                    {activeReport === 'module' && (
                      <>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Score (%)</th>
                        <th style={{ textAlign: 'center' }}>Errors</th>
                        <th style={{ textAlign: 'center', backgroundColor: '#f3e8ff' }}>Grade</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sectionStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.displayName}</td>
                      
                      {activeReport === 'roster' && <td>{student.email}</td>}

                      {activeReport === 'gradebook' && (
                        <>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{student.progressPercentage}%</td>
                          {experiments.map(exp => {
                            const details = student.completions[exp.id];
                            return (
                              <td key={exp.id} style={{ textAlign: 'center', lineHeight: '1.3' }}>
                                {details?.completed ? (
                                  <>
                                    <span style={{ fontWeight: 'bold', color: details.grade >= 75 ? '#059669' : '#e11d48' }}>
                                      {getEaristGrade(details.grade)}
                                    </span>
                                    <br />
                                    <span style={{ fontSize: '9px', color: '#64748b' }}>({details.grade}%)</span>
                                  </>
                                ) : '-'}
                              </td>
                            );
                          })}
                        </>
                      )}

                      {activeReport === 'module' && (
                        <>
                          {student.completions[moduleFilter]?.completed ? (
                            <>
                              <td style={{ textAlign: 'center' }}>Completed</td>
                              <td style={{ textAlign: 'center' }}>{student.completions[moduleFilter].grade}%</td>
                              <td style={{ textAlign: 'center' }}>{student.completions[moduleFilter].errors}</td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {getEaristGrade(student.completions[moduleFilter].grade)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ textAlign: 'center', color: '#94a3b8' }}>Pending</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        <div style={{ marginTop: '40px', fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontFamily: 'sans-serif', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
          OFFICIAL CLASS RECORD — Generated by Lab Buddy
        </div>
      </div>

    </div>
  );
};

export default InstructorReports;