import React, { useState, useEffect } from 'react';
import { 
  FiX, FiShield, FiLink, FiCpu, FiCheckCircle, FiAlertTriangle, 
  FiRefreshCw, FiFileText, FiPrinter, FiEye, FiLock, 
  FiUnlock, FiCopy, FiLayers, FiDatabase, FiAlertOctagon, 
  FiSearch, FiPlusCircle, FiArrowRight, FiCheck, FiActivity
} from 'react-icons/fi';
import { 
  getBlockchainBlocks, mineEvidenceBlock, verifyBlockchain, 
  simulateTamperAttack, repairBlockchain, getSection65BCertificate, 
  getCryptoFlow, logAuditEvent 
} from '../api/client';

export default function BlockchainLedgerModal({ onClose, activeCase = 'dawood' }) {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'crypto'
  const [blocks, setBlocks] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Mining Form State
  const [showMineModal, setShowMineModal] = useState(false);
  const [mineForm, setMineForm] = useState({
    case_id: activeCase,
    evidence_type: 'DIGITAL_FORENSIC_EXTRACTION',
    payload_summary: '',
    payload_data_str: '{\n  "file_name": "seized_device_dump.raw",\n  "md5": "d41d8cd98f00b204e9800998ecf8427e",\n  "imei": "864209048172901",\n  "seizure_location": "Bhendi Bazaar Safehouse"\n}',
    officer_badge: 'MH-ATS-8821',
    validator_node: 'CFSL Central Forensic Server (New Delhi)'
  });

  // Crypto Tracker State
  const [cryptoCase, setCryptoCase] = useState(
    ['cyber_bengaluru', 'drug_punjab', 'dawood', 'money_gujarat'].includes(activeCase) 
      ? activeCase 
      : 'cyber_bengaluru'
  );
  const [customWallet, setCustomWallet] = useState('');
  const [cryptoFlowData, setCryptoFlowData] = useState(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [frozenAccounts, setFrozenAccounts] = useState(new Set());

  // Load Blockchain Ledger & Verify on mount
  const loadLedger = async () => {
    setLoading(true);
    try {
      const [blocksRes, verifyRes] = await Promise.all([
        getBlockchainBlocks(),
        verifyBlockchain()
      ]);
      setBlocks(blocksRes.blocks || []);
      setChainStatus(verifyRes);
      if (blocksRes.blocks && blocksRes.blocks.length > 0 && !selectedBlock) {
        setSelectedBlock(blocksRes.blocks[blocksRes.blocks.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load blockchain ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Crypto Flow
  const loadCryptoFlow = async (caseId, wallet = null) => {
    setCryptoLoading(true);
    try {
      const res = await getCryptoFlow(caseId, wallet || null);
      setCryptoFlowData(res);
    } catch (err) {
      console.error('Failed to load crypto flow:', err);
    } finally {
      setCryptoLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  useEffect(() => {
    if (activeTab === 'crypto') {
      loadCryptoFlow(cryptoCase, customWallet);
    }
  }, [activeTab, cryptoCase]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const verifyRes = await verifyBlockchain();
      setChainStatus(verifyRes);
      const blocksRes = await getBlockchainBlocks();
      setBlocks(blocksRes.blocks || []);
      setStatusMessage({
        type: verifyRes.chain_status === 'VALID' ? 'success' : 'error',
        text: verifyRes.chain_status === 'VALID'
          ? 'Cryptographic Audit Passed: 100% SHA-256 Merkle Linkages Verified'
          : `SECURITY ALERT: Tamper detected at Block #${verifyRes.corrupted_block_index}! Hash mismatch flag raised.`
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTamperSimulation = async (blockIndex) => {
    setLoading(true);
    try {
      const res = await simulateTamperAttack(blockIndex);
      setStatusMessage({
        type: 'warning',
        text: `Simulated adversarial tamper attack on Block #${blockIndex}: ${res.mutation_details}`
      });
      await handleVerify();
    } catch (err) {
      console.error('Tamper simulation failed', err);
      setLoading(false);
    }
  };

  const handleRepairChain = async () => {
    setLoading(true);
    try {
      const res = await repairBlockchain();
      setStatusMessage({
        type: 'success',
        text: `Blockchain Integrity Restored. ${res.message}`
      });
      await handleVerify();
    } catch (err) {
      console.error('Chain repair failed', err);
      setLoading(false);
    }
  };

  const handleOpenCertificate = async (blockIndex) => {
    try {
      const cert = await getSection65BCertificate(blockIndex);
      setCertificateData(cert);
      setShowCertificateModal(true);
    } catch (err) {
      console.error('Failed to fetch certificate', err);
    }
  };

  const handleMineSubmit = async (e) => {
    e.preventDefault();
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(mineForm.payload_data_str);
      } catch (err) {
        alert('Invalid JSON in payload data. Please correct it.');
        return;
      }

      await mineEvidenceBlock({
        case_id: mineForm.case_id,
        evidence_type: mineForm.evidence_type,
        payload_summary: mineForm.payload_summary || `${mineForm.evidence_type} Evidence Sealed on Ledger`,
        payload_data: parsedData,
        officer_badge: mineForm.officer_badge,
        validator_node: mineForm.validator_node
      });

      setShowMineModal(false);
      setStatusMessage({
        type: 'success',
        text: 'New immutable evidence block successfully mined & notarized!'
      });
      setTimeout(() => setStatusMessage(null), 5000);
      await loadLedger();
    } catch (err) {
      console.error('Mining failed', err);
      alert('Failed to mine block: ' + err.message);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const toggleFreezeAccount = (accNumber) => {
    setFrozenAccounts(prev => {
      const next = new Set(prev);
      const isFreezing = !next.has(accNumber);
      if (isFreezing) {
        next.add(accNumber);
        logAuditEvent({
          action: 'LEGAL_FREEZE_NOTICE_ISSUED',
          resource: `ACCOUNT:${accNumber}`,
          details: `Issued emergency freeze notice under Section 102 CrPC for suspected P2P mule cashout account (${accNumber})`,
          severity: 'WARNING',
          user: 'OFFICER-ATS-402'
        });
      } else {
        next.delete(accNumber);
        logAuditEvent({
          action: 'LEGAL_FREEZE_REVOKED',
          resource: `ACCOUNT:${accNumber}`,
          details: `Revoked freeze notice for account (${accNumber}) pending additional judicial clearance`,
          severity: 'INFO',
          user: 'OFFICER-ATS-402'
        });
      }
      return next;
    });
  };

  const isChainTampered = chainStatus && chainStatus.chain_status === 'TAMPERED';

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0e14] border border-[#1e293b] w-full max-w-7xl h-[92vh] rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-gray-200">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0d131f] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FiShield className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Blockchain & Crypto Intelligence
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                  PoA Consensus
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-400 border border-blue-800/40">
                  Sec 65B / Sec 63
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tamper-evident chain of custody & dark web cryptocurrency tracking
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-[#07090e] p-1 rounded-lg border border-[#1e293b]">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiLink className="text-xs" />
              Evidence Ledger
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'crypto'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiActivity className="text-xs" />
              Crypto Flow Tracker
            </button>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2">
            {activeTab === 'ledger' && (
              <>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131d33] border border-[#1e293b] hover:border-emerald-500/50 text-emerald-400 rounded-lg text-xs font-medium hover:bg-[#16233f] transition-all"
                  title="Verify SHA-256 Merkle Chain Integrity"
                >
                  <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                  Verify Chain
                </button>

                {isChainTampered ? (
                  <button
                    onClick={handleRepairChain}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 border border-emerald-400 text-black font-bold rounded-lg text-xs hover:bg-emerald-500 transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  >
                    <FiShield className="text-xs" />
                    Restore Integrity
                  </button>
                ) : (
                  <button
                    onClick={() => handleTamperSimulation(selectedBlock ? selectedBlock.index : 1)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/50 border border-red-800/40 text-red-300 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-all"
                    title="Simulate adversarial byte modification on current block"
                  >
                    <FiAlertTriangle className="text-xs" />
                    Simulate Tamper
                  </button>
                )}

                <button
                  onClick={() => setShowMineModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 rounded-lg text-xs font-medium hover:bg-cyan-900/50 transition-all"
                >
                  <FiPlusCircle className="text-xs" />
                  Mine Block
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1e293b]/60 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all"
              title="Close Modal"
            >
              <FiX className="text-base" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast Bar */}
        {statusMessage && (
          <div className={`px-6 py-2 text-xs font-semibold flex items-center justify-between border-b ${
            statusMessage.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/50' :
            statusMessage.type === 'error' ? 'bg-red-950/90 text-red-300 border-red-800/50 animate-pulse' :
            'bg-amber-950/90 text-amber-300 border-amber-800/50'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <FiCheckCircle className="text-sm text-emerald-400" />}
              {statusMessage.type === 'error' && <FiAlertOctagon className="text-sm text-red-400" />}
              {statusMessage.type === 'warning' && <FiAlertTriangle className="text-sm text-amber-400" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white">
              <FiX className="text-xs" />
            </button>
          </div>
        )}

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 bg-[#07090e]">

          {/* TAB 1: BLOCKCHAIN LEDGER */}
          {activeTab === 'ledger' && (
            <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
              
              {/* Left Column: Chain Overview & Block Carousel */}
              <div className="lg:w-7/12 flex flex-col gap-3 h-full overflow-hidden">
                
                {/* Status KPI Card */}
                <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                  isChainTampered 
                    ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#0f172a]/60 border-[#1e293b]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      isChainTampered
                        ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isChainTampered ? <FiAlertOctagon className="text-xl" /> : <FiCheckCircle className="text-xl" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase text-gray-400">Chain Status:</span>
                        <span className={`text-xs font-bold tracking-wider ${
                          isChainTampered ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {isChainTampered ? 'CRITICAL: INTEGRITY COMPROMISED' : '100% IMMUTABLE & VERIFIED'}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500">
                          ({blocks.length} Blocks)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isChainTampered 
                          ? `Corrupted block identified: Block #${chainStatus?.corrupted_block_index} failed SHA-256 payload seal.`
                          : 'Proof-of-Authority (PoA) consensus notarized across CFSL and CBI nodes.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#0b0e14] border border-[#1e293b] text-cyan-400 font-medium">
                      Sec 65B IEA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0b0e14] border border-[#1e293b] text-blue-400 font-medium">
                      Sec 63 BSA 2023
                    </span>
                  </div>
                </div>

                {/* Blocks Grid / List */}
                <div className="flex-1 bg-[#0b0e14] border border-[#1e293b] rounded-xl p-3 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b]">
                    <div className="flex items-center gap-2">
                      <FiLayers className="text-emerald-400 text-sm" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Blockchain Explorer ({blocks.length} Blocks)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Chain Chronology (Oldest → Latest)
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {blocks.map((block) => {
                      const isSelected = selectedBlock && selectedBlock.index === block.index;
                      const isCorrupted = chainStatus?.chain_status === 'TAMPERED' && chainStatus?.corrupted_block_index === block.index;

                      return (
                        <div
                          key={block.index}
                          onClick={() => setSelectedBlock(block)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isCorrupted
                              ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                              : isSelected
                              ? 'bg-[#131b2e] border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                              : 'bg-[#0f172a]/50 border-[#1e293b] hover:border-gray-700 hover:bg-[#131d33]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isCorrupted
                                  ? 'bg-red-500 text-black font-extrabold'
                                  : isSelected
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-[#1e293b] text-gray-300'
                              }`}>
                                #{String(block.index).padStart(2, '0')}
                              </span>
                              <span className="text-xs font-semibold text-white truncate">
                                {block.evidence_type}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 shrink-0">
                                {block.case_id.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-gray-400 font-mono">
                                {block.timestamp ? new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                              </span>
                              {isCorrupted ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-black">
                                  TAMPERED
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                  SEALED
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {block.payload_summary}
                          </p>

                          <div className="mt-1.5 pt-1.5 border-t border-[#1e293b]/50 flex items-center justify-between text-[10px] font-mono text-gray-500">
                            <div className="flex items-center gap-1 text-gray-400">
                              <span>Badge:</span>
                              <span className="text-gray-300 font-semibold">{block.officer_badge}</span>
                            </div>
                            <div className="truncate max-w-[50%] text-gray-500" title={block.validator_node}>
                              {block.validator_node}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Block Inspector */}
              <div className="lg:w-5/12 flex flex-col h-full bg-[#0b0e14] border border-[#1e293b] rounded-xl p-4 overflow-hidden">
                {selectedBlock ? (
                  <div className="flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Header with Title and Actions */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-black">
                            BLOCK #{selectedBlock.index}
                          </span>
                          <span className="text-sm font-bold text-white">
                            Cryptographic Evidence Seal
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 mt-0.5 block">
                          Case: <span className="text-emerald-400 font-semibold">{selectedBlock.case_id}</span> | Time: {new Date(selectedBlock.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenCertificate(selectedBlock.index)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      >
                        <FiFileText className="text-xs text-cyan-400" />
                        Sec 65B Certificate
                      </button>
                    </div>

                    {/* Cryptographic Verification Hashes */}
                    <div className="mt-3 p-3 bg-[#07090e] border border-[#1e293b] rounded-xl space-y-2 text-xs font-mono">
                      {/* Block Hash */}
                      <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#1e293b]/80">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">SHA-256 Header Hash</span>
                          <button
                            onClick={() => handleCopy(selectedBlock.hash, 'block_hash')}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px]"
                            title="Copy SHA-256 hash"
                          >
                            {copiedHash === 'block_hash' ? <FiCheck className="text-xs" /> : <FiCopy className="text-xs" />}
                            <span>{copiedHash === 'block_hash' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-emerald-400 break-all text-[11px] select-all">
                          {selectedBlock.hash}
                        </div>
                      </div>

                      {/* Merkle Root */}
                      <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#1e293b]/80">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Merkle Root (Payload Seal)</span>
                          <button
                            onClick={() => handleCopy(selectedBlock.merkle_root, 'merkle_root')}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                            title="Copy Merkle root"
                          >
                            {copiedHash === 'merkle_root' ? <FiCheck className="text-xs" /> : <FiCopy className="text-xs" />}
                            <span>{copiedHash === 'merkle_root' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-cyan-400 break-all text-[11px] select-all">
                          {selectedBlock.merkle_root}
                        </div>
                      </div>

                      {/* Previous Block Hash */}
                      <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#1e293b]/80">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Previous Block Hash</span>
                          <button
                            onClick={() => handleCopy(selectedBlock.previous_hash, 'prev_hash')}
                            className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-[10px]"
                            title="Copy previous hash"
                          >
                            {copiedHash === 'prev_hash' ? <FiCheck className="text-xs" /> : <FiCopy className="text-xs" />}
                            <span>{copiedHash === 'prev_hash' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-gray-400 break-all text-[11px] select-all">
                          {selectedBlock.previous_hash}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                      <div className="p-2 bg-[#07090e] border border-[#1e293b] rounded-lg">
                        <span className="text-[10px] uppercase text-gray-500 font-mono block">Investigating Officer</span>
                        <span className="text-xs font-semibold text-white">{selectedBlock.officer_badge}</span>
                      </div>
                      <div className="p-2 bg-[#07090e] border border-[#1e293b] rounded-lg">
                        <span className="text-[10px] uppercase text-gray-500 font-mono block">Notarizing CFSL Node</span>
                        <span className="text-xs font-semibold text-emerald-400 truncate block" title={selectedBlock.validator_node}>
                          {selectedBlock.validator_node}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Payload Breakdown */}
                    <div className="mt-3 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                          Sealed Evidence Payload
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          JSON Immutable Object
                        </span>
                      </div>
                      <div className="p-3 bg-[#05070a] border border-[#1e293b] rounded-xl text-xs font-mono text-emerald-300/90 overflow-auto custom-scrollbar max-h-52">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(selectedBlock.payload_data, null, 2)}</pre>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    Select a block on the left to inspect its cryptographic certificate and Merkle seal.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DARK WEB CRYPTO NARCO-FLOW TRACKER */}
          {activeTab === 'crypto' && (
            <div className="h-full flex flex-col gap-4 overflow-hidden">
              
              {/* Top Controls: Case Select & Custom Address Filter */}
              <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Target Investigation:
                  </span>
                  <select
                    value={cryptoCase}
                    onChange={(e) => {
                      setCryptoCase(e.target.value);
                      setCustomWallet('');
                    }}
                    className="bg-[#07090e] border border-[#1e293b] text-amber-400 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="cyber_bengaluru">Apex Ransomware Syndicate (15 BTC Flow)</option>
                    <option value="drug_punjab">Golden Crescent Heroin Hawala (450K USDT Flow)</option>
                    <option value="dawood">D-Company Dubai Bullion Escrow (850 ETH Flow)</option>
                    <option value="money_gujarat">Surat Diamond Hawala Multi-Sig Flow</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                    <input
                      type="text"
                      placeholder="Paste BTC / USDT / ETH address to trace on-chain..."
                      value={customWallet}
                      onChange={(e) => setCustomWallet(e.target.value)}
                      className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => loadCryptoFlow(cryptoCase, customWallet)}
                    disabled={cryptoLoading}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all"
                  >
                    {cryptoLoading ? 'Tracing...' : 'Trace'}
                  </button>
                </div>
              </div>

              {/* Metric Highlights Banner */}
              {cryptoFlowData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0b0e14] border border-[#1e293b] rounded-xl">
                    <span className="text-[10px] uppercase text-gray-400 font-mono block">Total Crypto Value</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {cryptoFlowData.total_amount_crypto}
                    </span>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      ≈ ₹{cryptoFlowData.fiat_equivalent_inr}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0b0e14] border border-[#1e293b] rounded-xl">
                    <span className="text-[10px] uppercase text-gray-400 font-mono block">Tainted Risk Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-red-400">
                        {cryptoFlowData.tainted_score}/100
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 border border-red-800/40 text-red-400">
                        CRITICAL
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      Mixer / Tumbler Infiltration
                    </span>
                  </div>

                  <div className="p-3 bg-[#0b0e14] border border-[#1e293b] rounded-xl">
                    <span className="text-[10px] uppercase text-gray-400 font-mono block">Mixer De-Obfuscation</span>
                    <span className="text-sm font-bold text-cyan-400 truncate block">
                      {cryptoFlowData.mixer_status}
                    </span>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      Tornado.Cash / ChipMixer
                    </span>
                  </div>

                  <div className="p-3 bg-[#0b0e14] border border-[#1e293b] rounded-xl">
                    <span className="text-[10px] uppercase text-gray-400 font-mono block">Indian P2P KYC Mules</span>
                    <span className="text-sm font-bold text-emerald-400 truncate block">
                      {cryptoFlowData.p2p_mule_nodes?.length || 2} Accounts Flagged
                    </span>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      Sec 102 CrPC Freeze Ready
                    </span>
                  </div>
                </div>
              )}

              {/* Multi-Hop Pipeline Visualizer */}
              <div className="flex-1 bg-[#0b0e14] border border-[#1e293b] rounded-xl p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <FiActivity className="text-amber-400 text-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      4-Stage On-Chain Laundering & Mule Off-Ramp Telemetry
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    Token: <span className="text-amber-400 font-bold">{cryptoFlowData?.currency || 'BTC'}</span>
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-4 custom-scrollbar">
                  {cryptoFlowData && cryptoFlowData.flow_hops ? (
                    cryptoFlowData.flow_hops.map((hop, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-[#07090e] border border-[#1e293b] rounded-xl relative hover:border-amber-500/40 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                              HOP #{hop.hop_index}: {hop.stage}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              TXID: <span className="text-cyan-400">{hop.txid?.slice(0, 16)}...</span>
                            </span>
                          </div>

                          <span className="text-xs font-mono font-bold text-amber-300">
                            {hop.amount}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 mt-2">
                          {hop.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1e293b]/60 text-xs font-mono">
                          <div className="p-2 bg-[#0b0e14] rounded border border-[#1e293b]/60">
                            <span className="text-[10px] text-gray-500 uppercase block">Source Wallet</span>
                            <span className="text-red-400 truncate block">{hop.source_wallet}</span>
                          </div>
                          <div className="p-2 bg-[#0b0e14] rounded border border-[#1e293b]/60">
                            <span className="text-[10px] text-gray-500 uppercase block">Destination Entity</span>
                            <span className="text-emerald-400 truncate block">{hop.target_wallet}</span>
                          </div>
                        </div>

                        {/* Special Mule Banking Card on Terminal Hops */}
                        {hop.mule_details && (
                          <div className="mt-3 p-3 bg-red-950/30 border border-red-600/40 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                                <FiAlertTriangle className="text-red-400" />
                                IDENTIFIED INDIAN P2P CASHOUT MULE
                              </span>
                              <button
                                onClick={() => toggleFreezeAccount(hop.mule_details.account_number)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                  frozenAccounts.has(hop.mule_details.account_number)
                                    ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                }`}
                              >
                                {frozenAccounts.has(hop.mule_details.account_number)
                                  ? 'Account Frozen (Sec 102)'
                                  : 'Issue Bank Account Freeze Notice'}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] font-mono text-gray-300">
                              <div>
                                <span className="text-gray-500 block text-[10px]">Beneficiary Name</span>
                                <span className="text-white font-semibold">{hop.mule_details.kyc_name}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-[10px]">Bank & Branch</span>
                                <span className="text-white">{hop.mule_details.bank_name} ({hop.mule_details.branch})</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-[10px]">Account / IFSC</span>
                                <span className="text-cyan-400">{hop.mule_details.account_number} ({hop.mule_details.ifsc})</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-[10px]">Linked Aadhaar</span>
                                <span className="text-amber-400">{hop.mule_details.aadhaar_hash}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                      {cryptoLoading ? 'Tracing dark web blockchain transactions...' : 'No crypto transactions found for this query.'}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* SUB-MODAL 1: SECTION 65B LEGAL CERTIFICATE VIEWER */}
      {showCertificateModal && certificateData && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] text-[#0f172a] w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-gray-300">
            
            {/* Action Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText className="text-amber-400 text-lg" />
                <span className="text-sm font-bold tracking-wide">
                  OFFICIAL DIGITAL FORENSIC CERTIFICATE (SECTION 65B IEA / SECTION 63 BSA)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  <FiPrinter className="text-xs" />
                  Print Certificate
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-gray-400 hover:text-white"
                >
                  <FiX className="text-base" />
                </button>
              </div>
            </div>

            {/* Certificate Paper View */}
            <div className="p-8 overflow-y-auto font-serif space-y-6 text-sm leading-relaxed bg-white">
              
              {/* Header Emblem */}
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  Government of India — Ministry of Home Affairs
                </h1>
                <h2 className="text-base font-semibold text-slate-700">
                  Central Forensic Science Laboratory (CFSL) & National Cyber Crime Unit
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872 & SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023
                </p>
              </div>

              {/* Certificate Body */}
              <div className="space-y-4">
                <p>
                  I, the undersigned Authorized Digital Forensics Examiner and Notary Node Validator, do hereby certify that the electronic record described herein has been securely extracted, verified, and sealed onto the <strong>CrimeNet Immutable National Security Blockchain</strong> without alteration or human interception.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Certificate Ref:</strong> {certificateData.certificate_id}</div>
                    <div><strong>Date of Notarization:</strong> {certificateData.issued_at}</div>
                    <div><strong>Case Name / ID:</strong> {certificateData.case_id}</div>
                    <div><strong>Evidence Classification:</strong> {certificateData.evidence_type}</div>
                    <div><strong>Investigating Officer:</strong> {certificateData.officer_badge}</div>
                    <div><strong>Validator Node:</strong> {certificateData.validator_node}</div>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">SHA-256 Block Header Hash</span>
                    <span className="text-slate-900 font-bold break-all">{certificateData.block_hash}</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">Merkle Root Hash (Payload Integrity)</span>
                    <span className="text-slate-900 font-bold break-all">{certificateData.merkle_root}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Evidence Summary & Parameters</h3>
                  <div className="p-3 bg-slate-50 border rounded text-xs font-mono">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(certificateData.payload_data, null, 2)}</pre>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">
                  I further certify that during the period over which the computer output was produced, the computer was operating properly and that the cryptographic hashes confirm that the evidence has remained bit-for-bit identical since first seizure.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex items-center justify-between border-t text-xs font-mono">
                <div>
                  <div className="font-bold text-slate-900">Digitally Signed by:</div>
                  <div className="text-slate-700">Officer Badge: {certificateData.officer_badge}</div>
                  <div className="text-slate-500">MH State Anti-Terrorism Squad</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">Verified by Validator Node:</div>
                  <div className="text-emerald-700 font-bold">CFSL-POA-VALIDATOR-01 [SEALED]</div>
                  <div className="text-slate-500">Government Cryptographic Seal</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUB-MODAL 2: MINE NEW EVIDENCE BLOCK FORM */}
      {showMineModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0b0e14] text-gray-200 border border-[#1e293b] w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiPlusCircle className="text-cyan-400 text-lg" />
                <span className="text-sm font-bold text-white">
                  Mine & Notarize New Evidence Block
                </span>
              </div>
              <button onClick={() => setShowMineModal(false)} className="text-gray-400 hover:text-white">
                <FiX className="text-base" />
              </button>
            </div>

            <form onSubmit={handleMineSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Target Case ID</label>
                  <input
                    type="text"
                    value={mineForm.case_id}
                    onChange={(e) => setMineForm({...mineForm, case_id: e.target.value})}
                    className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 text-white font-mono outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Evidence Type</label>
                  <select
                    value={mineForm.evidence_type}
                    onChange={(e) => setMineForm({...mineForm, evidence_type: e.target.value})}
                    className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="DIGITAL_FORENSIC_EXTRACTION">DIGITAL_FORENSIC_EXTRACTION</option>
                    <option value="SEIZED_VOIP_AUDIO_TELEMETRY">SEIZED_VOIP_AUDIO_TELEMETRY</option>
                    <option value="HAWALA_TOKEN_LEDGER">HAWALA_TOKEN_LEDGER</option>
                    <option value="BORDER_UAV_RADAR_COORDINATES">BORDER_UAV_RADAR_COORDINATES</option>
                    <option value="COLD_STORAGE_CRYPTO_SEIZURE">COLD_STORAGE_CRYPTO_SEIZURE</option>
                    <option value="CCTV_FACIAL_BIOMETRIC_MATCH">CCTV_FACIAL_BIOMETRIC_MATCH</option>
                    <option value="BALLISTIC_FORENSIC_REPORT">BALLISTIC_FORENSIC_REPORT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Payload Summary / Case Note</label>
                <input
                  type="text"
                  placeholder="e.g. Seized iPhone 15 encrypted WhatsApp database decrypted with Cellebrite"
                  value={mineForm.payload_summary}
                  onChange={(e) => setMineForm({...mineForm, payload_summary: e.target.value})}
                  className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Evidence Payload Data (JSON Object)</label>
                <textarea
                  rows={5}
                  value={mineForm.payload_data_str}
                  onChange={(e) => setMineForm({...mineForm, payload_data_str: e.target.value})}
                  className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 font-mono text-cyan-300 outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Officer Badge ID</label>
                  <input
                    type="text"
                    value={mineForm.officer_badge}
                    onChange={(e) => setMineForm({...mineForm, officer_badge: e.target.value})}
                    className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 text-white font-mono outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Validator Node</label>
                  <input
                    type="text"
                    value={mineForm.validator_node}
                    onChange={(e) => setMineForm({...mineForm, validator_node: e.target.value})}
                    className="w-full bg-[#07090e] border border-[#1e293b] rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowMineModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1e293b] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Mine Block on Ledger
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
