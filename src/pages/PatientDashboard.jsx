import React, { useState, useEffect } from 'react';
import { Activity, FileText, Calendar, AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

// --- FIXED: This dynamically picks Render in production and localhost in development ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PatientDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // --- FIXED: Using API_BASE_URL instead of hardcoded localhost ---
        const response = await fetch(`${API_BASE_URL}/api/records`);
        const data = await response.json();
        setRecords(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const getRiskBadge = (score) => {
    switch (score) {
      case 'CRITICAL ALERT':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> CRITICAL</span>;
      case 'WARNING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> WARNING</span>;
      case 'HEALTHY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> HEALTHY</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> {score || 'PENDING'}</span>;
    }
  };

  const latestRecord = records[0];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">System ID: <span className="text-medical-600">PT-9921 (Rishabh Test)</span></p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-bold shadow-sm">
          <ShieldCheck className="w-5 h-5" /> AI Monitoring Active
        </div>
      </header>

      {/* Dynamic Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-medical-50 text-medical-600 rounded-full flex items-center justify-center"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Total Records Analyzed</p>
            <p className="text-2xl font-bold text-slate-800">{records.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Latest AI Status</p>
            <p className="text-xl font-bold text-slate-800">{latestRecord?.riskScore || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Calendar className="w-6 h-6" /></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Next Checkup</p>
            <p className="text-xl font-bold text-slate-800">In 2 Weeks</p>
          </div>
        </div>
      </div>

      {/* AI Analysis Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Recent AI Analyses</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider bg-white">
              <th className="px-8 py-4 font-semibold">Category</th>
              <th className="px-8 py-4 font-semibold">File Name</th>
              <th className="px-8 py-4 font-semibold">Upload Date</th>
              <th className="px-8 py-4 font-semibold">AI Risk Score</th>
              <th className="px-8 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <React.Fragment key={record._id}>
                <tr className={`hover:bg-slate-50/50 transition-colors ${expandedId === record._id ? 'bg-slate-50' : ''}`}>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                      record.fileType === 'ultrasound' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {record.fileType?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-700">{record.fileName || 'Untitled'}</td>
                  <td className="px-8 py-5 text-slate-500 text-sm">
                    {new Date(record.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">{getRiskBadge(record.riskScore)}</td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                      className="text-medical-600 hover:text-medical-800 font-bold text-sm bg-medical-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {expandedId === record._id ? 'Close Report' : 'View Details'}
                    </button>
                  </td>
                </tr>

                {expandedId === record._id && (
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td colSpan="5" className="px-8 py-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          Late Fusion Telemetry Breakdown
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50">
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">U-Net Spatial Analysis</p>
                            <p className="text-sm text-slate-500 mb-1 font-medium">Fetal Head Circumference</p>
                            <p className="font-black text-slate-800 text-xl">
                              {record.fetalHC ? `${record.fetalHC} mm` : 'N/A'}
                            </p>
                          </div>

                          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100/50">
                            <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mb-1">RF Tabular Analysis</p>
                            <p className="text-sm text-slate-500 mb-1 font-medium">Maternal Complication Risk</p>
                            <p className="font-black text-slate-800 text-xl">
                              {record.maternalRisk ? `${(record.maternalRisk * 100).toFixed(1)}%` : 'N/A'}
                            </p>
                          </div>

                          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50">
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Patient Vitals</p>
                            <p className="text-sm text-slate-500 mb-1 font-medium">BP | Age | Blood Sugar</p>
                            <p className="font-bold text-slate-700 text-md mt-1">
                              {record.vitals?.SystolicBP ? 
                                `${record.vitals.SystolicBP}/${record.vitals.DiastolicBP} mmHg | ${record.vitals.Age} yrs | ${record.vitals.BS}` 
                                : 'No vitals provided'}
                            </p>
                          </div>
                        </div>
                        
                        {record.filePath && record.filePath !== 'N/A' && (
                          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                            <a 
                              {/* FIXED: Using API_BASE_URL for images too */}
                              href={`${API_BASE_URL}/${record.filePath.replace(/\\/g, '/')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Open Raw Scan Image
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {records.length === 0 && !loading && (
          <div className="p-10 text-center text-slate-500 font-medium">No records found. Upload a scan to begin.</div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
