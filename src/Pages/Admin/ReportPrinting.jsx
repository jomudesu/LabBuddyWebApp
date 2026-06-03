import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Users, 
  FlaskConical, 
  Archive, 
  FileText,
  Calendar
} from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase'; 

const ReportsPrinting = () => {
  const [activeReport, setActiveReport] = useState('users');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState('');

  // ─── DATA FETCHING (ON DEMAND) ───
  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    setReportDate(new Date().toLocaleString());
    
    try {
      let targetCollection = '';
      if (reportType === 'users') targetCollection = 'users';
      if (reportType === 'experiments') targetCollection = 'experiment';
      if (reportType === 'inventory') targetCollection = 'inventory';

      const q = query(collection(db, targetCollection));
      const querySnapshot = await getDocs(q);
      
      const data = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        
        if (docData.createdAt) {
          docData.createdAtStr = docData.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
          docData.createdAtStr = 'N/A';
        }

        data.push({ id: doc.id, ...docData });
      });

      if (reportType === 'users') data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      if (reportType === 'experiments') data.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      if (reportType === 'inventory') data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setReportData(data);
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

  const reportTypes = [
    { id: 'users', title: 'User Directory', icon: Users, color: 'blue' },
    { id: 'experiments', title: 'Experiment Catalog', icon: FlaskConical, color: 'purple' },
    { id: 'inventory', title: 'Global Inventory', icon: Archive, color: 'emerald' },
  ];

  const userRoles = ['admin', 'instructor', 'student'];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full">
      
      {/* ─── INJECTED PRINT CSS (A4 FIT & CENTERING) ─── */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          
          html, body, #root {
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          
          #printable-document {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background-color: white !important;
            color: black !important;
            padding: 0 !important; 
            margin: 0 !important;
          }
          
          #printable-document * {
            visibility: visible !important;
          }

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
                isActive 
                  ? `bg-slate-900 border border-slate-700 shadow-md` 
                  : 'border border-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
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
        <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 rounded-t-2xl shrink-0">
          <div className="flex items-center">
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
          
          <button 
            onClick={handlePrint}
            disabled={loading || reportData.length === 0}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={18} className="mr-2" />
            Print to PDF / A4
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
              <p className="font-medium tracking-wider uppercase text-xs">Compiling Report...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Archive size={40} className="mb-4 opacity-50" />
              <p className="font-bold text-lg">No data found</p>
            </div>
          ) : (
            activeReport === 'users' ? (
              <div className="space-y-8">
                {userRoles.map(role => {
                  const roleUsers = reportData.filter(u => (u.role || 'student').toLowerCase() === role);
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
                    {reportData.map((item, idx) => (
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
            Generated on: {reportDate} | Total Records: {reportData.length}
          </p>
        </div>

        {activeReport === 'users' ? (
          userRoles.map(role => {
            const roleUsers = reportData.filter(u => (u.role || 'student').toLowerCase() === role);
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
              {reportData.map((item) => (
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