import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, Image, CheckCircle, ShieldCheck, Loader2, AlertCircle, Activity } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Upload = () => {
  const [activeTab, setActiveTab] = useState('ultrasound');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); 
  const fileInputRef = useRef(null);

  const [manualData, setManualData] = useState({
    Age: '', SystolicBP: '', DiastolicBP: '', BS: '', BodyTemp: '', HeartRate: ''
  });

  const handleManualChange = (e) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
  };

  const handleUploadSubmit = async () => {
    setUploadStatus('uploading');
    const formData = new FormData();

    // Key must match 'medicalFile' in backend handle_upload
    if (selectedFile) {
      formData.append('medicalFile', selectedFile);
    }

    // Pass all manual data to the backend
    Object.keys(manualData).forEach(key => {
      if (manualData[key] !== '') {
        formData.append(key, manualData[key]);
      }
    });

    // Key must match 'fileType' in backend handle_upload
    formData.append('fileType', activeTab);

    try {
      // 🌟 FIXED: Removed trailing slash so it perfectly matches Render's @app.post("/upload")
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        mode: 'cors',
        body: formData,
        // NOTE: We do NOT set headers manually for FormData. 
        // The browser will automatically set the correct boundary.
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload Success:", data);
        setUploadStatus('success');
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        setUploadStatus('error');
      }
    } catch (error) {
      console.error("Upload network/CORS error:", error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload & Data Entry</h1>
        <p className="text-slate-500 mt-2">Submit scans or enter patient vitals for AI analysis.</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-8">
        <button onClick={() => setActiveTab('ultrasound')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'ultrasound' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500'}`}>
          <Image className="w-4 h-4" /> Ultrasound Scan
        </button>
        <button onClick={() => setActiveTab('manual_blood')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'manual_blood' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500'}`}>
          <Activity className="w-4 h-4" /> Enter Vitals
        </button>
      </div>

      {activeTab === 'ultrasound' ? (
        <div className="border-2 border-dashed rounded-3xl p-16 text-center border-slate-300">
             <h3 className="text-xl font-bold text-slate-800">Drag & drop your scan images here</h3>
             <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
             <button onClick={() => fileInputRef.current.click()} className="mt-4 bg-slate-200 px-6 py-2 rounded-lg">
               {selectedFile ? selectedFile.name : 'Browse Files'}
             </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Patient Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.keys(manualData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{key}</label>
                <input 
                  type="number" 
                  step="any"
                  name={key}
                  value={manualData[key]}
                  onChange={handleManualChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500"
                  placeholder={`Enter ${key}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleUploadSubmit}
          disabled={uploadStatus === 'uploading'}
          className="bg-medical-500 hover:bg-medical-600 disabled:bg-medical-300 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-medical-500/30 transition-all flex items-center gap-2"
        >
          {uploadStatus === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Run AI Analysis'}
        </button>
      </div>
      
      {uploadStatus === 'success' && <p className="text-center text-green-600 mt-4 font-bold">Analysis complete! Check dashboard.</p>}
      {uploadStatus === 'error' && <p className="text-center text-rose-600 mt-4 font-bold">Error connecting to server. Please check console for CORS details.</p>}
    </div>
  );
};

export default Upload;
