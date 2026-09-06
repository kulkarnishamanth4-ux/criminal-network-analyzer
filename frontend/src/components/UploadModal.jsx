import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FiX, 
  FiUploadCloud, 
  FiFileText, 
  FiCheckCircle, 
  FiDownload, 
  FiEye, 
  FiDatabase, 
  FiCalendar, 
  FiHardDrive,
  FiAlertTriangle
} from 'react-icons/fi';
import { uploadFile, getUploadedFiles, getFilePreview } from '../api/client';

export default function UploadModal({ onClose, onSuccess, activeCase }) {
  const [activeTab, setActiveTab] = useState('fir');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

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
      setUploadedFiles(Array.isArray(files) ? files : []);
    } catch (err) {
      console.error("Failed to load files", err);
      setUploadedFiles([]);
    }
  }, [activeCase]);

  useEffect(() => {
    loadUploadedFiles();
  }, [loadUploadedFiles]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setResult(null);
    
    try {
      const res = await uploadFile(activeTab, acceptedFiles[0], activeCase);
      setResult({ success: true, data: res });
      await loadUploadedFiles();
      setTimeout(() => {
        setResult(null);
        if (onSuccess) onSuccess();
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
    if (!file) return;
    setSelectedFile(file);
    setIsPreviewLoading(true);
    setPreviewData(null);
    setPreviewError(null);
    
    try {
      const fileId = file.id;
      const data = await getFilePreview(activeCase, fileId);
      setPreviewData(data);
    } catch (err) {
      console.error("Preview fetch error:", err);
      setPreviewError(err.response?.data?.detail || "Failed to load file preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setPreviewError(null);
  };

  const typeColors = {
    fir: 'bg-red-500/20 text-red-400 border border-red-500/40',
    cdr: 'bg-teal-500/20 text-teal-400 border border-teal-500/40',
    financial: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    vehicle: 'bg-green-500/20 text-green-400 border border-green-500/40'
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dateStr);
    }
  };

  // Safe entity extraction for FIR text highlighting
  const highlightedFirContent = useMemo(() => {
    if (!previewData) return null;
    const rawText = previewData.raw_content || previewData.raw_text || '';
    if (!rawText) return 'No content available in file.';

    const entitiesObj = previewData.parsed_preview?.entities;
    if (!entitiesObj) return rawText;

    // Collect all entities safely into a flat list
    const entitiesList = [];
    if (Array.isArray(entitiesObj)) {
      entitiesObj.forEach(e => {
        if (e && (e.name || e.text)) {
          entitiesList.push({ name: e.name || e.text, type: e.type || e.label || 'ENTITY' });
        }
      });
    } else if (typeof entitiesObj === 'object') {
      (entitiesObj.persons || []).forEach(p => entitiesList.push({ name: typeof p === 'string' ? p : p.name, type: 'PERSON' }));
      (entitiesObj.locations || []).forEach(l => entitiesList.push({ name: typeof l === 'string' ? l : l.name, type: 'LOCATION' }));
      (entitiesObj.phones || []).forEach(ph => entitiesList.push({ name: typeof ph === 'string' ? ph : ph.number || ph.name, type: 'PHONE' }));
      (entitiesObj.vehicles || []).forEach(v => entitiesList.push({ name: typeof v === 'string' ? v : v.plate || v.name, type: 'VEHICLE' }));
      (entitiesObj.organizations || []).forEach(o => entitiesList.push({ name: typeof o === 'string' ? o : o.name, type: 'ORGANIZATION' }));
    }

    // Filter out invalid or short names to avoid broken replaces
    const validEntities = entitiesList
      .filter(e => e.name && String(e.name).trim().length > 2)
      .sort((a, b) => b.name.length - a.name.length); // match longer names first

    if (validEntities.length === 0) return rawText;

    // Escape regex special chars
    const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const typeStyles = {
      PERSON: 'bg-red-500/20 text-red-300 border-b border-red-500 font-semibold px-1 rounded',
      LOCATION: 'bg-blue-500/20 text-blue-300 border-b border-blue-500 font-semibold px-1 rounded',
      PHONE: 'bg-teal-500/20 text-teal-300 border-b border-teal-500 font-mono font-semibold px-1 rounded',
      VEHICLE: 'bg-green-500/20 text-green-300 border-b border-green-500 font-mono font-semibold px-1 rounded',
      ORGANIZATION: 'bg-purple-500/20 text-purple-300 border-b border-purple-500 font-semibold px-1 rounded'
    };

    let processedHtml = rawText;
    validEntities.forEach((ent) => {
      try {
        const pattern = new RegExp(`\\b(${escapeRegex(ent.name)})\\b`, 'gi');
        const styleClass = typeStyles[ent.type] || 'bg-yellow-500/20 text-yellow-300 px-1 rounded';
        processedHtml = processedHtml.replace(pattern, `<mark class="${styleClass}">$1</mark>`);
      } catch (err) {
        // ignore regex error on weird names
      }
    });

    return processedHtml;
  }, [previewData]);

  // Safe row extraction for CSV tables
  const csvRows = useMemo(() => {
    if (!previewData) return [];
    const pp = previewData.parsed_preview;
    if (Array.isArray(pp)) return pp;
    if (pp && Array.isArray(pp.records)) return pp.records;
    return [];
  }, [previewData]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#080f1d] border border-[#1e3a5f] rounded-xl w-full max-w-5xl h-[88vh] shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col text-[#c8d6e5] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1e3a5f] bg-[#060c18]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#64ffda]/10 border border-[#64ffda]/30 flex items-center justify-center text-[#64ffda]">
              <FiUploadCloud size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Evidence Ingestion Hub
              </h2>
              <div className="text-[11px] text-[#8892b0] flex items-center gap-2">
                <span>Active Case:</span>
                <span className="font-mono text-[#64ffda] bg-[#64ffda]/10 px-1.5 py-0.2 rounded border border-[#64ffda]/20">
                  {activeCase}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg border border-[#1e3a5f] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Main Vault & Ingestion View */}
          <div className={`flex flex-col w-full overflow-y-auto p-6 space-y-6 ${selectedFile ? 'hidden' : 'block'}`}>
            
            {/* Section A: Sample Data Downloads */}
            <div className="border border-[#1e3a5f]/80 rounded-xl p-4 bg-[#0a1526]/60 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64ffda] flex items-center gap-2">
                  <FiDownload size={14} /> Sample Evidence Datasets (Download & Test)
                </h3>
                <span className="text-[10px] text-[#8892b0] font-mono">Ready to upload</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a 
                  href="/samples/sample_fir_report.txt" 
                  download 
                  className="flex items-center gap-2 bg-[#0c1a2f] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2.5 rounded-lg transition-all hover:bg-[#12233f] text-[#c8d6e5] group"
                >
                  <FiFileText className="text-red-400 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">FIR Report</div>
                    <div className="text-[10px] text-gray-400 font-mono">.txt (NLP Parsing)</div>
                  </div>
                </a>

                <a 
                  href="/samples/sample_cdr_records.csv" 
                  download 
                  className="flex items-center gap-2 bg-[#0c1a2f] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2.5 rounded-lg transition-all hover:bg-[#12233f] text-[#c8d6e5] group"
                >
                  <FiDatabase className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">CDR Logs</div>
                    <div className="text-[10px] text-gray-400 font-mono">.csv (Call Chains)</div>
                  </div>
                </a>

                <a 
                  href="/samples/sample_financial_ledger.csv" 
                  download 
                  className="flex items-center gap-2 bg-[#0c1a2f] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2.5 rounded-lg transition-all hover:bg-[#12233f] text-[#c8d6e5] group"
                >
                  <FiDatabase className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">Financial Ledger</div>
                    <div className="text-[10px] text-gray-400 font-mono">.csv (Money Flows)</div>
                  </div>
                </a>

                <a 
                  href="/samples/sample_vehicle_sightings.csv" 
                  download 
                  className="flex items-center gap-2 bg-[#0c1a2f] border border-[#1e3a5f] hover:border-[#64ffda] text-xs p-2.5 rounded-lg transition-all hover:bg-[#12233f] text-[#c8d6e5] group"
                >
                  <FiDatabase className="text-green-400 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">Vehicle Sightings</div>
                    <div className="text-[10px] text-gray-400 font-mono">.csv (ANPR GPS)</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Section B: Upload Zone */}
            <div className="border border-[#1e3a5f]/80 rounded-xl bg-[#0a1526]/60 overflow-hidden">
              <div className="flex border-b border-[#1e3a5f] bg-[#070e1a]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-all ${
                      activeTab === tab.id 
                        ? 'text-[#64ffda] border-b-2 border-[#64ffda] bg-[#10223a]' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#0c1a2f]'
                    }`}
                    onClick={() => { setActiveTab(tab.id); setResult(null); }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {result?.success ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-200">
                    <FiCheckCircle className="text-4xl text-emerald-400 mb-3 animate-bounce" />
                    <h3 className="text-base font-bold text-white mb-1">Evidence Ingested Successfully</h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Entities and graph topologies rebuilt for case: {activeCase}
                    </p>
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-[#64ffda] bg-[#64ffda]/10 scale-[0.99]' 
                        : 'border-[#1e3a5f] hover:border-[#64ffda]/60 bg-[#070e1a]'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#64ffda]"></div>
                        <span className="text-xs text-[#64ffda] font-mono">Ingesting & computing graph metrics...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[#10223a] border border-[#1e3a5f] flex items-center justify-center text-[#64ffda] mb-3">
                          <FiUploadCloud size={24} />
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">
                          Drop your {activeTab.toUpperCase()} file here, or <span className="text-[#64ffda] underline">browse files</span>
                        </p>
                        <p className="text-xs text-[#8892b0]">
                          Supports .txt reports and .csv datasets up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                )}
                {result?.error && (
                  <div className="mt-4 p-3 bg-red-500/10 text-red-400 text-xs border border-red-500/30 rounded-lg flex items-center gap-2">
                    <FiAlertTriangle /> {result.error}
                  </div>
                )}
              </div>
            </div>

            {/* Section C: Evidence Vault (Uploaded Files) */}
            <div className="border border-[#1e3a5f]/80 rounded-xl p-4 bg-[#0a1526]/60 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64ffda] flex items-center gap-2">
                  <FiHardDrive size={14} /> Uploaded Evidence Vault ({uploadedFiles.length})
                </h3>
                <span className="text-[10px] text-[#8892b0]">Click any file to preview contents</span>
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-8 border border-dashed border-[#1e3a5f]/40 rounded-lg">
                  No files uploaded yet for this investigation. Use the upload area above or try a sample kit!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      onClick={() => handlePreview(file)}
                      className="flex justify-between items-center p-3 border border-[#1e3a5f] hover:border-[#64ffda] rounded-lg cursor-pointer transition-all bg-[#0c1a2f] hover:bg-[#12233f] group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${typeColors[file.file_type] || 'bg-gray-700 text-gray-200'}`}>
                          {file.file_type}
                        </span>
                        <span className="text-sm text-white font-medium group-hover:text-[#64ffda] transition-colors truncate">
                          {file.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono shrink-0">
                        <span className="flex items-center gap-1">
                          <FiHardDrive size={11} /> {formatFileSize(file.file_size)}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <FiCalendar size={11} /> {formatDate(file.uploaded_at)}
                        </span>
                        <button className="flex items-center gap-1 text-[11px] text-[#64ffda] bg-[#64ffda]/10 px-2 py-1 rounded border border-[#64ffda]/30 group-hover:bg-[#64ffda] group-hover:text-black transition-colors">
                          <FiEye size={12} /> Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Interactive Previewer Panel (Slide-over Modal Panel) */}
          {selectedFile && (
            <div className="absolute inset-0 bg-[#080f1d] flex flex-col z-20 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Preview Bar */}
              <div className="flex justify-between items-center px-6 py-3 border-b border-[#1e3a5f] bg-[#060c18]">
                <div className="flex items-center gap-3 truncate">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${typeColors[selectedFile.file_type] || 'bg-gray-700 text-gray-200'}`}>
                    {selectedFile.file_type}
                  </span>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate">{selectedFile.filename}</h3>
                    <div className="text-[10px] text-[#8892b0] font-mono">
                      {formatFileSize(selectedFile.file_size)} • Uploaded {formatDate(selectedFile.uploaded_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={closePreview} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e3a5f] hover:border-red-500/50 hover:bg-red-500/10 text-xs font-semibold text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <FiX size={14} /> Close Preview
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isPreviewLoading ? (
                  <div className="flex flex-col justify-center items-center h-full gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#64ffda]"></div>
                    <span className="text-xs text-[#64ffda] font-mono">Decrypting and loading preview...</span>
                  </div>
                ) : previewError ? (
                  <div className="p-6 text-center text-red-400 flex flex-col items-center gap-2">
                    <FiAlertTriangle size={32} />
                    <div className="font-bold">Unable to Preview File</div>
                    <div className="text-xs text-gray-400">{previewError}</div>
                  </div>
                ) : (
                  <>
                    {/* FIR Preview: Highlights Entities */}
                    {selectedFile.file_type === 'fir' ? (
                      <div className="space-y-4">
                        {/* Summary & Legend Banner */}
                        <div className="p-3 bg-[#0c1a2f] border border-[#1e3a5f] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-400">Detected Crime:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                              {previewData?.parsed_preview?.crime_type || 'Unknown'} 
                              {previewData?.parsed_preview?.crime_confidence ? ` (${Math.round(previewData.parsed_preview.crime_confidence * 100)}%)` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="text-gray-400">Entity Colors:</span>
                            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">PERSON</span>
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">LOCATION</span>
                            <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">PHONE</span>
                            <span className="px-1.5 py-0.2 rounded bg-green-500/20 text-green-300 border border-green-500/40">VEHICLE</span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">ORGANIZATION</span>
                          </div>
                        </div>

                        {/* Highlighted text viewport */}
                        <div className="font-mono text-xs sm:text-sm whitespace-pre-wrap bg-[#050b14] p-5 rounded-lg border border-[#1e3a5f] leading-relaxed text-gray-300 shadow-inner">
                          {typeof highlightedFirContent === 'string' && highlightedFirContent.includes('<mark') ? (
                            <div dangerouslySetInnerHTML={{ __html: highlightedFirContent }} />
                          ) : (
                            <div>{previewData?.raw_content || previewData?.raw_text || 'No text available.'}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CSV Preview: Interactive Table */
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs text-[#8892b0] font-mono px-1">
                          <span>PARSED DATA STREAM</span>
                          <span>
                            {csvRows.length > 0 
                              ? `Showing first ${csvRows.length} records` 
                              : 'No parsed records available'}
                          </span>
                        </div>

                        {csvRows.length > 0 ? (
                          <div className="overflow-x-auto border border-[#1e3a5f] rounded-lg shadow-inner">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-[#0f2139] text-[#64ffda] uppercase border-b border-[#1e3a5f]">
                                <tr>
                                  <th className="p-2.5 border-r border-[#1e3a5f]/50 w-12 text-center text-gray-500">#</th>
                                  {Object.keys(csvRows[0]).map((colKey) => (
                                    <th key={colKey} className="p-2.5 border-r border-[#1e3a5f]/50 whitespace-nowrap">
                                      {colKey}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {csvRows.map((row, rowIdx) => (
                                  <tr 
                                    key={rowIdx} 
                                    className={`border-b border-[#1e3a5f]/30 hover:bg-[#12243d] transition-colors ${
                                      rowIdx % 2 === 0 ? 'bg-[#060c18]' : 'bg-[#081120]'
                                    }`}
                                  >
                                    <td className="p-2 border-r border-[#1e3a5f]/40 text-center text-gray-500 select-none">
                                      {rowIdx + 1}
                                    </td>
                                    {Object.keys(csvRows[0]).map((colKey, colIdx) => (
                                      <td key={colIdx} className="p-2 border-r border-[#1e3a5f]/30 text-gray-300 whitespace-nowrap">
                                        {String(row[colKey] !== undefined ? row[colKey] : '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* Raw text fallback if CSV couldn't be parsed into rows */
                          <div className="font-mono text-xs whitespace-pre-wrap bg-[#050b14] p-4 rounded-lg border border-[#1e3a5f] text-gray-400">
                            {previewData?.raw_content || 'No raw CSV content available.'}
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
