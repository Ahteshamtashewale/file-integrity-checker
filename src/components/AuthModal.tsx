import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Key, CheckCircle, AlertTriangle, Fingerprint, ShieldAlert } from 'lucide-react';
import { UserSession, UserRole } from '../types/fim';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onUpdateSession: (newSession: UserSession) => void;
}

const PRESET_USERS: Record<UserRole, { username: string; fullName: string; email: string; token: string }> = {
  admin: {
    username: 'sec_admin',
    fullName: 'Alex Vance (Lead SecOps)',
    email: 'alex.vance@defense.soc',
    token: 'aegis_jwt_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlzcyI6ImFlZ2lzLWZpbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbImJhc2VsaW5lOmNyZWF0ZSIsImJhc2VsaW5lOnVwZGF0ZSIsInRhbXBlcjppbmplY3QiLCJsb2dzOmRlbGV0ZSJdfQ'
  },
  analyst: {
    username: 'sec_analyst',
    fullName: 'Dana Scully (SOC Analyst)',
    email: 'dana.scully@defense.soc',
    token: 'aegis_jwt_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmFseXN0IiwiaXNzIjoiYWVnaXMtZmltIiwicm9sZSI6ImFuYWx5c3QiLCJwZXJtaXNzaW9ucyI6WyJzY2FuOnJ1biIsImRpZmY6aW5zcGVjdCIsInZhbGlkYXRpb246dGVzdCJdfQ'
  },
  auditor: {
    username: 'intern_auditor',
    fullName: 'Jordan Miller (Virtual Intern / Auditor)',
    email: 'jordan.intern@university.edu',
    token: 'aegis_jwt_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdWRpdG9yIiwiaXNzIjoiYWVnaXMtZmltIiwicm9sZSI6ImF1ZGl0b3IiLCJwZXJtaXNzaW9ucyI6WyJyZWFkOm9ubHkiLCJkb3NzaWVyOmV4cG9ydCIsInRlc3RzOnJ1biJdfQ'
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(session.role);
  const [totpCode, setTotpCode] = useState(session.mfaVerified ? '734892' : '');
  const [mfaError, setMfaError] = useState('');
  const [activeTab, setActiveTab] = useState<'switch' | 'concepts'>('switch');

  if (!isOpen) return null;

  const handleApply = () => {
    if (totpCode.trim().length !== 6) {
      setMfaError('Please enter a valid 6-digit TOTP / MFA verification code');
      return;
    }

    const userData = PRESET_USERS[selectedRole];
    onUpdateSession({
      ...userData,
      role: selectedRole,
      mfaVerified: true,
      loginTime: new Date().toISOString()
    });
    setMfaError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Authentication &amp; Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Cryptographic Identity, Zero-Trust Session Management &amp; Least Privilege
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'switch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Role Switcher &amp; Session
          </button>
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'concepts'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Authentication Concepts &amp; Architecture
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'switch' ? (
            <div className="space-y-6">
              {/* Role Selectors */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select User Role Persona:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Admin */}
                  <div
                    onClick={() => setSelectedRole('admin')}
                    className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-rose-950/40 border-rose-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-rose-400">Administrator</span>
                      {selectedRole === 'admin' && <CheckCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Full authority: Commit new baselines, inject simulated tampers, manage system rules.
                    </p>
                  </div>

                  {/* Analyst */}
                  <div
                    onClick={() => setSelectedRole('analyst')}
                    className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                      selectedRole === 'analyst'
                        ? 'bg-cyan-950/40 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-cyan-400">Security Analyst</span>
                      {selectedRole === 'analyst' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Operational: Run scans, inspect cryptographic diffs, test input validation payloads.
                    </p>
                  </div>

                  {/* Auditor */}
                  <div
                    onClick={() => setSelectedRole('auditor')}
                    className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                      selectedRole === 'auditor'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-emerald-400">Auditor / Intern</span>
                      {selectedRole === 'auditor' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Compliance: Read-only access to baselines, run automated test suites, export project dossier.
                    </p>
                  </div>
                </div>
              </div>

              {/* MFA / TOTP Verification Simulation */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Multi-Factor Authentication (TOTP Code)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTotpCode('839104')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Auto-Fill Demo Code
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code (e.g. 839104)"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white font-mono tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Time-Synchronized (RFC 6238)</span>
                  </div>
                </div>
                {mfaError && (
                  <p className="text-[11px] text-rose-400 mt-1.5">{mfaError}</p>
                )}
              </div>

              {/* Token & Authorization Header preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Cryptographic Bearer Token (Simulated JWT):</span>
                  <span className="font-mono text-[10px] text-cyan-400">RS256 Signature</span>
                </div>
                <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {PRESET_USERS[selectedRole].token}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-white mb-1">The AAA Security Framework</h4>
                <p className="text-slate-400 leading-relaxed mb-2">
                  In a resilient File Integrity Monitor, security is anchored upon three pillars:
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li><strong className="text-cyan-300">1. Authentication:</strong> Verifies the true identity of the operator via cryptographic credentials and multi-factor authentication (MFA).</li>
                  <li><strong className="text-cyan-300">2. Authorization:</strong> Governs role permissions via Role-Based Access Control (RBAC). A student or auditor cannot overwrite production file baselines.</li>
                  <li><strong className="text-cyan-300">3. Accounting:</strong> Every action (baseline updates, file modifications, scans) is bound to the authenticated actor in a tamper-evident audit log.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-white mb-1">Principle of Least Privilege (PoLP)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Every user is granted strictly the minimal privileges required to complete their assigned role. This prevents lateral privilege escalation if an analyst's credentials are breached.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-white mb-1">Defending Against Rogue Baseline Commits</h4>
                <p className="text-slate-400 leading-relaxed">
                  If an attacker tampers with a file and also possesses permission to take a new baseline snapshot, they could disguise their backdoor as legitimate. Defense-in-depth requires immutable baselines sealed with master cryptographic signatures and dual-approval workflows.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            Active: <span className="font-mono text-white">{session.username}</span> ({session.role})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-850 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
            >
              Apply Role &amp; Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
