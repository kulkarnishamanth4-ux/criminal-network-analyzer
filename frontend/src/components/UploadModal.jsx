import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUploadCloud, FiFileText, FiCheckCircle, FiDownload } from 'react-icons/fi';
import { uploadFile, getUploadedFiles, getFilePreview } from '../api/client';

export default function UploadModal({ onClose, onSuccess, activeCase }) {
  const [activeTab, setActiveTab] = useState('fir');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const tabs = [
    { id: 'fir', label: 'FIR Docs (.txt)' },
    { id: 'cdr', label: 'CDR Logs (.csv)' },
    { id: 'financial', label: 'Financial (.csv)' },
    { id: 'vehicle', label: 'Vehicle DB (.csv)' }
  ];

  const loadUploadedFiles = useCallback(async () => {
    if (!activeCase) return;
    try {
      const files = await getUploadedFiles(activeCase);
      setUploadedFiles(files);
    } catch (err) {
      console.error("Failed to load files", err);
    }
  }, [activeCase]);

  useEffect(() => {
    loadUploadedFiles();
  }, [loadUploadedFiles]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setResult(null);
    
    try {
      const res = await uploadFile(activeTab, acceptedFiles[0], activeCase);
      setResult({ success: true, data: res });
      await loadUploadedFiles();
      setTimeout(() => {
        setResult(null);
        if(onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Upload failed. Please check server logs.';
      setResult({ success: false, error: msg });
    } finally {
      setIsUploading(false);
    }
  }, [activeTab, activeCase, onSuccess, loadUploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false 
  });

  const handlePreview = async (file) => {
    setSelectedFile(file);
    setIsPreviewLoading(true);
    setPreviewData(null);
    try {
      const data = await getFilePreview(activeCase, file.id || file.filename); // Assuming file has id or filename
      setPreviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setSelectedFile(null);
    setPreviewData(null);
  };

  const typeColors = {
    fir: 'bg-blue-500',
    cdr: 'bg-green-500',
    financial: 'bg-yellow-500',
    vehicle: 'bg-purple-500'
  };

  // entity highlighting for FIR
  const renderHighlightedText = (text, preview) => {
    if (!preview || !preview.entities) return text;
    let highlightedText = text;
    // VERY simple string replace - in a real app, you'd use a robust highlighter that avoids HTML injection
    // and overlapping matches, but we'll do a quick version based on instructions
    const colors = { PERSON: 'red', LOCATION: 'blue', PHONE: 'teal', VEHICLE: 'green', ORGANIZATION: 'purple' };
    
    preview.entities.forEach(ent => {
       const color = colors[ent.label] || 'gray';
       const regex = new RegExp(`(${ent.text})`, 'gi');
       highlightedText = highlightedText.replace(regex, `<span style="color: ${color}; font-weight: bold;">$1</span>`);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-lg w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col text-[#c8d6e5]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#1e3a5f] bg-[#0a1628]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiUploadCloud className="text-[#64ffda]" />
            Evidence Vault & Data Ingestion
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main content area */}
          <div className={`flex flex-col w-full overflow-y-auto p-6 space-y-6 ${selectedFile ? 'hidden' : 'block'}`}>
            
            {/* Section A: Sample Data Downloads */}
            <div className="border border-[#1e3a5f] rounded-lg p-4 bg-[#0a1628]/50">
              <h3 className="text-sm font-bold mb-3 text-[#64ffda]">Sample Data Kits</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a href="/samples/sample_fir_report.txt" download className="flex items-center justify-center gap-2 bg-[#0a1628] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2 rounded transition-colors">
                  <FiDownload /> FIR Report
                </a>
                <a href="/samples/sample_cdr_records.csv" download className="flex items-center justify-center gap-2 bg-[#0a1628] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2 rounded transition-colors">
                  <FiDownload /> CDR Records
                </a>
                <a href="/samples/sample_financial_ledger.csv" download className="flex items-center justify-center gap-2 bg-[#0a1628] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2 rounded transition-colors">
                  <FiDownload /> Financial Ledger
                </a>
                <a href="/samples/sample_vehicle_sightings.csv" download className="flex items-center justify-center gap-2 bg-[#0a1628] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2 rounded transition-colors">
                  <FiDownload /> Vehicle Sightings
                </a>
              </div>
            </div>

            {/* Section B: Upload Zone */}
            <div className="border border-[#1e3a5f] rounded-lg bg-[#0a1628]/50 flex flex-col">
              <div className="flex border-b border-[#1e3a5f]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
                      activeTab === tab.id 
                        ? 'text-[#64ffda] border-b-2 border-[#64ffda] bg-[#1e3a5f]/30' 
                        : 'text-gray-400 hover:bg-[#1e3a5f]/10'
                    }`}
                    onClick={() => { setActiveTab(tab.id); setResult(null); }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {result?.success ? (
                   <div className="py-6 flex flex-col items-center justify-center text-center">
                     <FiCheckCircle className="text-4xl text-green-400 mb-4" />
                     <h3 className="text-lg font-bold mb-2 text-green-400">Ingestion Complete</h3>
                   </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-[#64ffda] bg-[#64ffda]/10' : 'border-[#1e3a5f] hover:border-gray-400 bg-[#0a1628]'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#64ffda] mb-2"></div>
                    ) : (
                      <>
                        <FiFileText className={`text-3xl mb-2 ${isDragActive ? 'text-[#64ffda]' : 'text-gray-400'}`} />
                        <p className="text-sm">Drag & drop or click to upload</p>
                      </>
                    )}
                  </div>
                )}
                {result?.error && <div className="mt-4 p-2 bg-red-500/10 text-red-400 text-sm border border-red-500/30 rounded">{result.error}</div>}
              </div>
            </div>

            {/* Section C: Evidence Vault */}
            <div className="border border-[#1e3a5f] rounded-lg p-4 bg-[#0a1628]/50 flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold mb-3 text-[#64ffda]">Evidence Vault</h3>
              {uploadedFiles.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">No files uploaded yet for this case.</div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} onClick={() => handlePreview(file)} className="flex justify-between items-center p-3 border border-[#1e3a5f] hover:border-[#64ffda] rounded cursor-pointer transition-colors bg-[#0a1628]">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white ${typeColors[file.file_type] || 'bg-gray-600'}`}>{file.file_type}</span>
                        <span className="text-sm">{file.filename}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{file.size || 'Unknown size'}</span>
                        <span>{file.uploaded_at || 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Interactive Previewer Panel */}
          {selectedFile && (
            <div className="absolute inset-0 bg-[#0a1628] flex flex-col z-10 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-[#1e3a5f]">
                <h3 className="text-sm font-bold text-[#64ffda]">Preview: {selectedFile.filename}</h3>
                <button onClick={closePreview} className="text-gray-400 hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {isPreviewLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#64ffda]"></div>
                  </div>
                ) : (
                  <>
                    {selectedFile.file_type === 'fir' ? (
                      <div className="font-mono text-sm whitespace-pre-wrap bg-[#05050f] p-4 rounded border border-[#1e3a5f]">
                        {renderHighlightedText(previewData?.raw_text || 'No text available', previewData?.parsed_preview)}
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-[#1e3a5f] rounded">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#1e3a5f]/50 text-gray-300">
                            <tr>
                              {previewData?.parsed_preview?.length > 0 && Object.keys(previewData.parsed_preview[0]).map((key) => (
                                <th key={key} className="p-2 border-b border-[#1e3a5f]">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData?.parsed_preview?.map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-[#0a1628]' : 'bg-[#05050f]'}>
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="p-2 border-b border-[#1e3a5f]/50 text-gray-400">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {previewData?.parsed_preview && (
                          <div className="p-2 text-xs text-gray-500 bg-[#05050f]">
                            Showing {previewData.parsed_preview.length} rows.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
