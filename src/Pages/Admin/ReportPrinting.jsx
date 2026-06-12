import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Users, 
  FlaskConical, 
  Archive, 
  FileText,
  Calendar,
  Search
} from 'lucide-react';
import { supabase } from '../../backend/Firebase/firebase'; 

const ReportsPrinting = () => {
  const [activeReport, setActiveReport] = useState('users');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState('');

  // ─── FILTER STATES ───
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Filters
  const [userRole, setUserRole] = useState('All');
  const [userStatus, setUserStatus] = useState('All');
  const [userSection, setUserSection] = useState('All'); // ✨ NEW
  
  // Experiment Filters
  const [expCategory, setExpCategory] = useState('All'); // ✨ NEW
  const [expDifficulty, setExpDifficulty] = useState('All');
  const [expStatus, setExpStatus] = useState('All');
  
  // Inventory Filters
  const [invCategory, setInvCategory] = useState('All');
  const [invHazard, setInvHazard] = useState('All');

  // Reset filters when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setUserRole('All'); setUserStatus('All'); setUserSection('All');
    setExpDifficulty('All'); setExpStatus('All'); setExpCategory('All');
    setInvCategory('All'); setInvHazard('All');
  }, [activeReport]);

  // ─── DATA FETCHING (SUPABASE) ───
  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    setReportDate(new Date().toLocaleString());
    
    try {
      let targetTable = '';
      if (reportType === 'users') targetTable = 'users';
      if (reportType === 'experiments') targetTable = 'experiments';
      if (reportType === 'inventory') targetTable = 'inventory';

      const { data, error } = await supabase.from(targetTable).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        ...item,
        displayName: item.display_name,
        createdAtStr: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
      }));

      if (reportType === 'users') formattedData.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      if (reportType === 'experiments') formattedData.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      if (reportType === 'inventory') formattedData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setReportData(formattedData);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport('users');
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // ✨ NEW: Dynamically generate class sections for the filter
  const sections = useMemo(() => {
    if (activeReport !== 'users') return ['All'];
    return ['All', ...new Set(reportData.filter(u => u.role === 'student' && u.section && u.section !== '-').map(u => u.section))];
  }, [reportData, activeReport]);

  // ─── FILTER LOGIC ───
  const processedData = useMemo(() => {
    return reportData.filter(item => {
      if (activeReport === 'users') {
        const matchesSearch = (item.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = userRole === 'All' || (item.role || 'student').toLowerCase() === userRole.toLowerCase();
        const matchesStatus = userStatus === 'All' || (item.status || 'active').toLowerCase() === userStatus.toLowerCase();
        const matchesSection = userSection === 'All' || item.section === userSection; // ✨ NEW
        return matchesSearch && matchesRole && matchesStatus && matchesSection;
      }
      if (activeReport === 'experiments') {
        const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = expCategory === 'All' || (item.category || '') === expCategory; // ✨ NEW
        const matchesDifficulty = expDifficulty === 'All' || (item.difficulty || 'Beginner') === expDifficulty;
        const matchesStatus = expStatus === 'All' || (item.status || 'published').toLowerCase() === expStatus.toLowerCase();
        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
      }
      if (activeReport === 'inventory') {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = invCategory === 'All' || (item.category || '') === invCategory;
        const matchesHazard = invHazard === 'All' || (item.hazard || 'None') === invHazard;
        return matchesSearch && matchesCategory && matchesHazard;
      }
      return true;
    });
  }, [reportData, activeReport, searchQuery, userRole, userStatus, userSection, expCategory, expDifficulty, expStatus, invCategory, invHazard]);

  const reportTypes = [
    { id: 'users', title: 'User Directory', icon: Users, color: 'blue' },
    { id: 'experiments', title: 'Experiment Catalog', icon: FlaskConical, color: 'purple' },
    { id: 'inventory', title: 'Global Inventory', icon: Archive, color: 'emerald' },
  ];

  const userRoles = ['admin', 'instructor', 'student'];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full">
      
      {/* ─── PRINT CSS (A4 FIT) ─── */}
      <style>{`
        @page { size: A4 portrait; margin: 15mm; }
        @media print {
          body * { visibility: hidden; }
          html, body, #root { position: static !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          #printable-document { display: block !important; visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 100% !important; background-color: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          #printable-document * { visibility: visible !important; }
          table { width: 100% !important; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; font-family: sans-serif; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border: 1px solid #94a3b8 !important; padding: 12px 16px !important; text-align: left; color: black !important; font-size: 12px; }
          th { background-color: #f8fafc !important; font-weight: bold; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 25px; font-family: sans-serif; }
          .role-heading { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #334155 !important; font-family: sans-serif; letter-spacing: 1px; }
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Reports & Printing</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Generate official PDF or paper records of system data.</p>
        </div>
      </div>

      {/* ─── COMPACT REPORT SELECTION TABS ─── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-sm shrink-0">
        {reportTypes.map((report) => {
          const isActive = activeReport === report.id;
          return (
            <button 
              key={report.id}
              onClick={() => generateReport(report.id)}
              className={`flex-1 flex items-center p-3 rounded-xl transition-all duration-300 ${
                isActive ? `bg-slate-900 border border-slate-700 shadow-md` : 'border border-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 shrink-0 ${isActive ? `bg-${report.color}-500/20 text-${report.color}-400` : 'bg-slate-700 text-slate-400'}`}>
                <report.icon size={18} />
              </div>
              <div className="text-left">
                <h3 className={`text-sm font-bold ${isActive ? 'text-slate-100' : ''}`}>{report.title}</h3>
                {isActive && <p className={`text-[10px] font-medium text-${report.color}-400 mt-0.5 uppercase tracking-wider`}>Active Report</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── PREVIEW SECTION (Dark Theme for Web) ─── */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl flex-1 flex flex-col min-h-[400px]">
        
        {/* ─── PREVIEW HEADER & INLINE FILTERS ─── */}
        <div className="p-4 md:p-6 border-b border-slate-700/50 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 bg-slate-900/50 rounded-t-2xl shrink-0">
          
          <div className="flex items-center shrink-0">
            <FileText className="text-blue-400 mr-3" size={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {reportTypes.find(r => r.id === activeReport)?.title} Preview
              </h2>
              <p className="text-xs font-medium text-slate-400 flex items-center mt-0.5">
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
                placeholder="Search..." 
                className="pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-blue-500 w-36 lg:w-48 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeReport === 'users' && (
              <>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
                <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="disabled">Disabled</option>
                </select>
                {/* ✨ NEW: Section Filter with proper disable logic */}
                <select 
                  value={userSection} 
                  onChange={(e) => setUserSection(e.target.value)} 
                  disabled={userRole === 'admin' || userRole === 'instructor'}
                  className={`px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500 transition-all ${userRole === 'admin' || userRole === 'instructor' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sections.map(sec => <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : sec}</option>)}
                </select>
              </>
            )}

            {activeReport === 'experiments' && (
              <>
                {/* ✨ NEW: Category Filter */}
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Categories</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                </select>
                <select value={expDifficulty} onChange={(e) => setExpDifficulty(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select value={expStatus} onChange={(e) => setExpStatus(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </>
            )}

            {activeReport === 'inventory' && (
              <>
                <select value={invCategory} onChange={(e) => setInvCategory(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Categories</option>
                  <option value="Chemical">Chemicals</option>
                  <option value="Glassware">Glassware</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Safety">Safety</option>
                </select>
                <select value={invHazard} onChange={(e) => setInvHazard(e.target.value)} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 outline-none focus:border-blue-500">
                  <option value="All">All Hazards</option>
                  <option value="None">Safe / None</option>
                  <option value="Flammable">Flammable</option>
                  <option value="Toxic">Toxic</option>
                  <option value="Corrosive">Corrosive</option>
                </select>
              </>
            )}

            <button 
              onClick={handlePrint}
              disabled={loading || processedData.length === 0}
              className="flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-auto 2xl:ml-2"
            >
              <Printer size={16} className="mr-2" />
              Print PDF
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
              <p className="font-medium tracking-wider uppercase text-xs">Compiling Report...</p>
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Archive size={40} className="mb-4 opacity-50" />
              <p className="font-bold text-lg">No records match your filters</p>
            </div>
          ) : (
            activeReport === 'users' ? (
              <div className="space-y-8">
                {userRoles.map(role => {
                  const roleUsers = processedData.filter(u => (u.role || 'student').toLowerCase() === role);
                  if (roleUsers.length === 0) return null;

                  return (
                    <div key={role}>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2 flex items-center">
                        <Users size={14} className="mr-2 text-slate-500" />
                        {role}s ({roleUsers.length})
                      </h3>
                      <div className="border border-slate-700 rounded-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead className="bg-slate-900/80">
                            <tr className="border-b border-slate-700">
                              <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Email</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Section</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {roleUsers.map((item, idx) => (
                              <tr key={item.id} className={idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent'}>
                                <td className="px-5 py-3 text-sm text-slate-200 font-medium">{item.displayName || 'Unknown'}</td>
                                <td className="px-5 py-3 text-sm text-slate-400">{item.email}</td>
                                <td className="px-5 py-3 text-sm text-slate-300">{item.section || '-'}</td>
                                <td className="px-5 py-3 text-sm text-slate-300 capitalize">{item.status || 'active'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-700 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-900/80">
                    <tr className="border-b border-slate-700">
                      {activeReport === 'experiments' && (
                        <>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Title</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Difficulty</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                        </>
                      )}
                      {activeReport === 'inventory' && (
                        <>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Asset Name</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Details</th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Hazard Level</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {processedData.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent'}>
                        {activeReport === 'experiments' && (
                          <>
                            <td className="px-5 py-3 text-sm text-slate-200 font-medium">{item.title}</td>
                            <td className="px-5 py-3 text-sm text-slate-400">{item.category}</td>
                            <td className="px-5 py-3 text-sm text-slate-300">{item.difficulty}</td>
                            <td className="px-5 py-3 text-sm text-slate-300 capitalize">{item.status || 'published'}</td>
                          </>
                        )}
                        {activeReport === 'inventory' && (
                          <>
                            <td className="px-5 py-3 text-sm text-slate-200 font-medium">{item.name}</td>
                            <td className="px-5 py-3 text-sm text-slate-400">{item.category}</td>
                            <td className="px-5 py-3 text-sm text-slate-300">{item.details || '-'}</td>
                            <td className="px-5 py-3 text-sm text-slate-300">{item.hazard === 'None' ? 'Safe' : item.hazard}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ─── HIDDEN PRINTABLE DOCUMENT (Only shows when printing) ─── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div id="printable-document" className="hidden print:block">
        <div className="print-header">
          <h1 style={{ margin: 0, fontSize: '26px' }}>Lab Buddy Command Center</h1>
          <h2 style={{ margin: '6px 0', fontSize: '18px', color: '#475569' }}>
            {reportTypes.find(r => r.id === activeReport)?.title}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Generated on: {reportDate} | Total Records: {processedData.length}
          </p>
        </div>

        {activeReport === 'users' ? (
          userRoles.map(role => {
            const roleUsers = processedData.filter(u => (u.role || 'student').toLowerCase() === role);
            if (roleUsers.length === 0) return null;

            return (
              <div key={role} style={{ marginBottom: '30px' }}>
                <div className="role-heading">{role}s</div>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th>Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleUsers.map(item => (
                      <tr key={item.id}>
                        <td>{item.displayName || 'Unknown'}</td>
                        <td>{item.email}</td>
                        <td>{item.section || '-'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{item.status || 'active'}</td>
                        <td>{item.createdAtStr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        ) : (
          <table>
            <thead>
              <tr>
                {activeReport === 'experiments' && (
                  <><th>Title</th><th>Category</th><th>Difficulty</th><th>Status</th><th>Date Created</th></>
                )}
                {activeReport === 'inventory' && (
                  <><th>Asset Name</th><th>Category</th><th>Details / Formula</th><th>Hazard Level</th><th>Added On</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {processedData.map((item) => (
                <tr key={item.id}>
                  {activeReport === 'experiments' && (
                    <>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.difficulty}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.status || 'published'}</td>
                      <td>{item.createdAtStr}</td>
                    </>
                  )}
                  {activeReport === 'inventory' && (
                    <>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.details || '-'}</td>
                      <td>{item.hazard === 'None' ? 'Safe' : item.hazard}</td>
                      <td>{item.createdAtStr}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '40px', fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontFamily: 'sans-serif', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
          CONFIDENTIAL & PROPRIETARY — Generated by Lab Buddy Virtual Chemistry System
        </div>
      </div>

    </div>
  );
};

export default ReportsPrinting;