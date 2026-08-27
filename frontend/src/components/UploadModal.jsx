import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUploadCloud, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { uploadFile } from '../api/client';

export default function UploadModal({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('fir');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  const tabs = [
    { id: 'fir', label: 'FIR Docs (.txt)' },
    { id: 'cdr', label: 'CDR Logs (.csv)' },
    { id: 'financial', label: 'Financial (.csv)' },
    { id: 'vehicle', label: 'Vehicle DB (.csv)' }
  ];

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setResult(null);
    
    try {
      const res = await uploadFile(activeTab, acceptedFiles[0]);
      setResult({ success: true, data: res });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Upload failed. Please check server logs.';
      setResult({ success: false, error: msg });
    } finally {
      setIsUploading(false);
    }
  }, [activeTab, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false 
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-[var(--bg-primary)]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiUploadCloud className="text-[var(--text-accent)]" />
            Data Ingestion Engine
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeTab === tab.id 
                  ? 'text-[var(--text-accent)] border-b-2 border-[var(--text-accent)] bg-[var(--bg-card-hover)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
              }`}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
            >
              {tab.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Dropzone Area */}
        <div className="p-6">
          {result?.success ? (
             <div className="py-12 flex flex-col items-center justify-center text-center">
               <FiCheckCircle className="text-5xl text-[var(--neon-green)] mb-4" />
               <h3 className="text-xl font-bold mb-2 text-[var(--neon-green)]">Ingestion Complete</h3>
               <p className="text-sm text-[var(--text-secondary)]">
                 Extracted {result.data.entities_extracted || result.data.records_processed || 0} entities<br/>
                 Created {result.data.relationships_created || 0} relationships
               </p>
               <p className="text-xs text-[var(--text-accent)] mt-4 animate-pulse">Updating intelligence graph...</p>
             </div>
          ) : (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[var(--text-accent)] bg-[var(--text-accent)]/10' : 'border-[var(--border)] hover:border-[var(--text-secondary)] bg-[var(--bg-primary)]'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--text-accent)] mb-4"></div>
                  <p className="text-sm font-medium">Processing Data...</p>
                </>
              ) : (
                <>
                  <FiFileText className={`text-4xl mb-4 ${isDragActive ? 'text-[var(--text-accent)]' : 'text-[var(--text-secondary)]'}`} />
                  <p className="text-sm font-medium mb-1">
                    {isDragActive ? 'Drop file to upload' : 'Drag & drop file here'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    or click to browse from your computer
                  </p>
                  <div className="mt-4 text-[10px] uppercase tracking-widest text-[var(--text-accent)] bg-[var(--bg-card-hover)] px-3 py-1 rounded">
                    {tabs.find(t => t.id === activeTab)?.label} required
                  </div>
                </>
              )}
            </div>
          )}

          {result?.error && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-500 text-sm text-center">
              {result.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
