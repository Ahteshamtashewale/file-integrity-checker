import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Copy, Terminal, Binary } from 'lucide-react';
import { MonitoredFile, HashAlgorithm } from '../types/fim';
import { calculateAvalanche } from '../utils/crypto';

interface DiffModalProps {
  file: MonitoredFile | null;
  algo: HashAlgorithm;
  onClose: () => void;
  onRestore: (fileId: string) => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({
  file,
  algo,
  onClose,
  onRestore
}) => {
  if (!file) return null;

  const currentHash = file.hashes[algo];
  const baselineHash = file.baselineHashes?.[algo] || 'Baseline hash not yet calculated';
  const hasChanged = currentHash !== baselineHash;

  const avalanche = hasChanged && file.baselineHashes
    ? calculateAvalanche(baselineHash, currentHash)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            {hasChanged ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{file.path}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  hasChanged ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {hasChanged ? 'INTEGRITY MISMATCH' : 'VERIFIED NOMINAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Algorithm: <span className="font-mono text-cyan-300">{algo}</span> · Permissions: <span className="font-mono">{file.permissions}</span>
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Tamper Alert Callout if changed */}
          {hasChanged && (
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/80 text-rose-200">
              <div className="flex items-center gap-2 font-semibold text-xs text-rose-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Unauthorized Tampering Detected: Cryptographic Signature Drift</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {file.tamperDetails || 'The current file content or metadata no longer matches the established baseline snapshot. This discrepancy indicates unauthorized file editing, malicious payload injection, or file replacement.'}
              </p>
            </div>
          )}

          {/* Hashes Comparison Grid */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-emerald-400">Golden Baseline Snapshot Hash ({algo}):</span>
                <span className="text-[11px] text-slate-500 font-mono">Immutable Reference</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-950 font-mono text-xs text-emerald-300 break-all select-all">
                {baselineHash}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className={`font-medium ${hasChanged ? 'text-rose-400' : 'text-slate-200'}`}>
                  Current Live File Hash ({algo}):
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Real-time Calculation</span>
              </div>
              <div className={`p-2.5 rounded-lg bg-slate-950 border font-mono text-xs break-all select-all ${
                hasChanged ? 'border-rose-950 text-rose-300' : 'border-slate-800 text-slate-300'
              }`}>
                {currentHash}
              </div>
            </div>
          </div>

          {/* Cryptographic Avalanche Effect breakdown */}
          {avalanche && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Cryptographic Avalanche Effect Analysis</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {avalanche.percentage}% Bit Divergence
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${avalanche.percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Even minor tampering changes <strong className="text-cyan-300">{avalanche.bitDifferences} of {avalanche.totalBits} total output bits</strong> in the hash. This mathematically confirms the strong collision and pre-image resistance of {algo}.
              </p>

              {/* Character by character diff visualization */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1.5 font-medium">
                  Hex Nibble Match Alignment (Green = Identical, Red = Flipped):
                </span>
                <div className="flex flex-wrap gap-0.5 p-2 rounded bg-slate-900 font-mono text-[10px] max-h-24 overflow-y-auto">
                  {avalanche.hexDiffMap.map((d, i) => (
                    <span
                      key={i}
                      className={`px-0.5 rounded ${
                        d.isMatch ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold'
                      }`}
                      title={`Index ${i}: Baseline '${d.char1}' vs Current '${d.char2}'`}
                    >
                      {d.char2}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live File Content Preview */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium text-slate-300">File Content Inspection:</span>
              <span className="font-mono text-[11px] text-slate-500">{file.size} bytes</span>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
              {file.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            Last Modified: <span className="font-mono text-slate-300">{file.lastModified}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasChanged && (
              <button
                onClick={() => {
                  onRestore(file.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-800/80 hover:bg-emerald-950/40 rounded-md transition-colors"
              >
                Restore to Baseline State
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-slate-200 hover:bg-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
