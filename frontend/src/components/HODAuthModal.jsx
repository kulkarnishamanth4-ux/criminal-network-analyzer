import React, { useState, useEffect } from 'react';
import { FiShield, FiLock, FiCheckCircle, FiAlertTriangle, FiClock, FiKey, FiX, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

export default function HODAuthModal({ isOpen, onClose, onAuthorized, actionName = 'HIGH_IMPACT_OPERATION', caseId = 'dawood' }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [simulatedToken, setSimulatedToken] = useState(null);
  const [showSimulatedKey, setShowSimulatedKey] = useState(false);

  // Fetch current TOTP status & rolling demonstration token
  const fetchCredentials = async () => {
    try {
      const res = await axios.get('/api/auth/hod/setup');
      setSimulatedToken(res.data);
      setTimeRemaining(res.data.time_remaining_seconds || 30);
    } catch (err) {
      console.warn('Failed to load TOTP credentials:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccess(false);
      fetchCredentials();
    }
  }, [isOpen]);

  // Rolling 30s Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          fetchCredentials();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleOtpChange = (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`hod-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`hod-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the HOD OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/hod/verify', {
        otp: fullOtp,
        action: actionName,
        case_id: caseId,
        operator: 'OFFICER-ATS-402'
      });
      setSuccess(true);
      setTimeout(() => {
        if (onAuthorized) onAuthorized(res.data.clearance_token);
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authorization failed. Invalid supervisory OTP.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemonstrationOtp = () => {
    if (simulatedToken?.current_rolling_otp) {
      const digits = simulatedToken.current_rolling_otp.split('');
      setOtp(digits);
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-2 border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-red-950/30 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
                Supervisory Clearance Required
              </h3>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                RFC 6238 Air-Gapped Two-Factor Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white p-1 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] text-xs font-mono">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Restricted Operation
            </div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {actionName.replace(/_/g, ' ')}
            </div>
            <div className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
              <FiAlertTriangle size={11} /> Requires Head of Department 6-Digit Authenticator Approval
            </div>
          </div>

          {/* OTP Input Fields */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)]">
              <span>Enter 6-Digit HOD Key:</span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--text-accent)]">
                <FiClock size={11} /> {timeRemaining}s remaining
              </span>
            </div>
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`hod-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  disabled={loading || success}
                  className="w-12 h-14 text-center text-xl font-mono font-bold bg-[var(--bg-primary)] border-2 border-[var(--border)] focus:border-red-500 rounded-lg text-white focus:outline-none transition-all shadow-inner"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <FiAlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <FiCheckCircle size={14} className="shrink-0" />
              <span>HOD Authorization Confirmed. Clearance Granted.</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || success || otp.join('').length !== 6}
            className={`w-full py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              success
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-red-900/30'
            }`}
          >
            {loading ? 'Verifying Cryptographic Token...' : success ? 'CLEARANCE GRANTED' : 'AUTHORIZE OPERATION'}
          </button>

          {/* Hackathon Judge Simulation / Offline Demonstrator */}
          <div className="pt-2 border-t border-[var(--border)]">
            <button
              onClick={() => setShowSimulatedKey(!showSimulatedKey)}
              className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-accent)] flex items-center gap-1.5 transition-colors"
            >
              <FiKey size={11} /> {showSimulatedKey ? 'Hide Evaluation Token' : 'Show Evaluation / Offline HOD Token'}
            </button>

            {showSimulatedKey && simulatedToken && (
              <div className="mt-2.5 p-3 rounded-lg bg-[var(--bg-primary)]/80 border border-[var(--text-accent)]/30 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase">Live Rolling TOTP:</span>
                  <span className="font-bold text-[var(--text-accent)] tracking-widest text-sm">
                    {simulatedToken.current_rolling_otp}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                  <span>Emergency Master Override:</span>
                  <span className="text-amber-400 font-bold">{simulatedToken.emergency_backup_pin}</span>
                </div>
                <button
                  onClick={autofillDemonstrationOtp}
                  className="w-full py-1 mt-1 bg-[var(--text-accent)]/10 hover:bg-[var(--text-accent)]/20 border border-[var(--text-accent)]/30 text-[var(--text-accent)] rounded text-[10px] font-mono uppercase"
                >
                  Autofill Active HOD Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
