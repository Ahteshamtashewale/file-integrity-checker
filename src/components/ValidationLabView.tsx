import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  FileSearch, 
  Code2, 
  Terminal, 
  Play, 
  RotateCcw,
  Binary,
  FolderLock,
  Hash
} from 'lucide-react';
import { HashAlgorithm, ValidationCheck } from '../types/fim';
import { 
  validateFilePath, 
  validateHashFormat, 
  verifyMagicBytes, 
  SAMPLE_ATTACK_VECTORS,
  MAGIC_SIGNATURES 
} from '../utils/validation';

export const ValidationLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'path' | 'hash' | 'magic'>('path');
  
  // Path validation state
  const [pathInput, setPathInput] = useState('../../../../etc/shadow');
  const [pathResult, setPathResult] = useState<ReturnType<typeof validateFilePath> | null>(() => validateFilePath('../../../../etc/shadow'));

  // Hash validation state
  const [hashInput, setHashInput] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [hashAlgo, setHashAlgo] = useState<HashAlgorithm>('SHA-256');
  const [hashResult, setHashResult] = useState<ReturnType<typeof validateHashFormat> | null>(() => validateHashFormat('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'SHA-256'));

  // Magic byte state
  const [magicFilename, setMagicFilename] = useState('quarterly_financials.pdf');
  const [magicHeaderHex, setMagicHeaderHex] = useState('4d5a90000300000004000000'); // MZ executable disguised as PDF
  const [magicResult, setMagicResult] = useState<ReturnType<typeof verifyMagicBytes> | null>(() => verifyMagicBytes('quarterly_financials.pdf', '4d5a90000300000004000000'));

  const handleTestPath = (input: string) => {
    setPathInput(input);
    setPathResult(validateFilePath(input));
  };

  const handleTestHash = (input: string, algo: HashAlgorithm) => {
    setHashInput(input);
    setHashAlgo(algo);
    setHashResult(validateHashFormat(input, algo));
  };

  const handleTestMagic = (filename: string, hex: string) => {
    setMagicFilename(filename);
    setMagicHeaderHex(hex);
    setMagicResult(verifyMagicBytes(filename, hex));
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Defensive Application Security
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Input Validation &amp; Sanitization Firewall</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Security Input Validation &amp; Payload Neutralization Lab
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            In modern File Integrity Monitoring architectures, untrusted inputs (file paths, hash strings, and uploaded binary streams) are primary attack surfaces. Test common adversary exploit vectors below to verify real-time boundary sanitization, canonical path enforcement, and magic-byte header inspection.
          </p>
        </div>
      </div>

      {/* Preset Attack Vectors Carousel */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Select Exploitation Test Payload:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_ATTACK_VECTORS.map((vec) => (
            <button
              key={vec.id}
              onClick={() => {
                if (vec.type === 'path') {
                  setActiveTab('path');
                  handleTestPath(vec.input);
                } else if (vec.type === 'hash') {
                  setActiveTab('hash');
                  handleTestHash(vec.input, 'SHA-256');
                } else if (vec.type === 'magic_byte') {
                  setActiveTab('magic');
                  handleTestMagic(vec.input, vec.mockHeader || '4d5a');
                }
              }}
              className="text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-cyan-400 truncate">{vec.label}</span>
                <span className="text-[10px] text-slate-500 font-mono capitalize">{vec.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {vec.description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-500 truncate bg-slate-900 px-2 py-0.5 rounded">
                {vec.input}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2">
          <button
            onClick={() => setActiveTab('path')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'path'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Path Traversal &amp; Canonical Sanitizer</span>
          </button>
          <button
            onClick={() => setActiveTab('hash')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'hash'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Cryptographic Hash Format Validator</span>
          </button>
          <button
            onClick={() => setActiveTab('magic')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'magic'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Magic Byte &amp; Extension Disguise Check</span>
          </button>
        </div>

        {/* Tab 1: Path Traversal Validator */}
        {activeTab === 'path' && (
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Input Target Path to Test:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pathInput}
                  onChange={(e) => {
                    setPathInput(e.target.value);
                    setPathResult(validateFilePath(e.target.value));
                  }}
                  placeholder="e.g. ../../etc/passwd or canonical path"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleTestPath(pathInput)}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Sanitize &amp; Check</span>
                </button>
              </div>
            </div>

            {/* Results breakdown */}
            {pathResult && (
              <div className="space-y-4">
                {/* Status banner */}
                <div className={`p-4 rounded-lg border ${
                  pathResult.isValid
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {pathResult.isValid ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {pathResult.isValid ? 'INPUT ACCEPTED - SANITIZED & SAFE' : `ATTACK THREAT DETECTED: ${pathResult.threatDetected}`}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {pathResult.isValid ? 'HTTP 200 OK' : 'HTTP 400 REJECTED'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    Sanitized Canonical Sandbox Path: <code className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded ml-1">{pathResult.sanitized}</code>
                  </p>
                </div>

                {/* Individual check items */}
                <div className="bg-slate-950 rounded-lg border border-slate-800 divide-y divide-slate-800/80">
                  {pathResult.checks.map((chk, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {chk.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200 font-medium">{chk.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono ${chk.passed ? 'text-emerald-400' : 'text-rose-400 font-semibold'}`}>
                        {chk.message}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Defensive code reference */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Defensive Implementation Architecture (Production Code Pattern):</span>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
{`// Safe canonical path containment resolution
import path from 'path';

function resolveSecureSandboxPath(baseSandboxDir: string, requestedPath: string): string {
  // 1. Strip null bytes
  const cleanPath = requestedPath.replace(/\\0/g, '');
  // 2. Resolve absolute target path
  const safeResolvedPath = path.resolve(baseSandboxDir, cleanPath);
  // 3. Confirm path stays strictly within the intended jail directory
  if (!safeResolvedPath.startsWith(path.resolve(baseSandboxDir))) {
    throw new SecurityException('CWE-22 Path Traversal Attack Detected');
  }
  return safeResolvedPath;
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Cryptographic Hash Format Validator */}
        {activeTab === 'hash' && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Hash String to Validate:
                </label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => {
                    setHashInput(e.target.value);
                    setHashResult(validateHashFormat(e.target.value, hashAlgo));
                  }}
                  placeholder="Paste 64-char hex hash..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Expected Algorithm:
                </label>
                <select
                  value={hashAlgo}
                  onChange={(e) => {
                    const newAlgo = e.target.value as HashAlgorithm;
                    setHashAlgo(newAlgo);
                    setHashResult(validateHashFormat(hashInput, newAlgo));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="SHA-256">SHA-256 (64 hex characters)</option>
                  <option value="SHA-512">SHA-512 (128 hex characters)</option>
                  <option value="SHA-1">SHA-1 (40 hex characters)</option>
                  <option value="MD5">MD5 (32 hex characters)</option>
                </select>
              </div>
            </div>

            {/* Hash Results */}
            {hashResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  hashResult.isValid
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    {hashResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {hashResult.isValid ? 'VALID CRYPTOGRAPHIC HASH DIGEST' : `FORMAT ERROR: ${hashResult.threatDetected}`}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    Target Algorithm: <strong className="font-mono text-white">{hashAlgo}</strong> · Expected length: {hashResult.expectedLength} hexadecimal nibbles.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 divide-y divide-slate-800/80">
                  {hashResult.checks.map((chk, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {chk.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200 font-medium">{chk.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono ${chk.passed ? 'text-emerald-400' : 'text-rose-400 font-semibold'}`}>
                        {chk.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Magic Byte & Extension Disguise Check */}
        {activeTab === 'magic' && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Filename with Declared Extension:
                </label>
                <input
                  type="text"
                  value={magicFilename}
                  onChange={(e) => {
                    setMagicFilename(e.target.value);
                    setMagicResult(verifyMagicBytes(e.target.value, magicHeaderHex));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Raw File Header Magic Bytes (Hex):
                </label>
                <input
                  type="text"
                  value={magicHeaderHex}
                  onChange={(e) => {
                    setMagicHeaderHex(e.target.value);
                    setMagicResult(verifyMagicBytes(magicFilename, e.target.value));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Quick Header Presets */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] text-slate-400 font-medium">Quick Header Presets:</span>
              <button
                type="button"
                onClick={() => handleTestMagic(magicFilename, '4d5a900003000000')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-rose-300 border border-rose-900"
              >
                4D 5A (DOS MZ Executable / Malware)
              </button>
              <button
                type="button"
                onClick={() => handleTestMagic(magicFilename, '255044462d312e35')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-900"
              >
                25 50 44 46 (%PDF Valid Document)
              </button>
              <button
                type="button"
                onClick={() => handleTestMagic('photo.png', '89504e470d0a1a0a')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-900"
              >
                89 50 4E 47 (PNG Valid Graphic)
              </button>
              <button
                type="button"
                onClick={() => handleTestMagic('installer.deb', '7f454c4602010100')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-900"
              >
                7F 45 4C 46 (Linux ELF Binary)
              </button>
            </div>

            {/* Magic Result */}
            {magicResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  magicResult.isValid
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    {magicResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {magicResult.isValid ? 'MAGIC BYTES MATCH EXTENSION SIGNATURE' : 'CRITICAL THREAT: EXTENSION SPOOFING / TROJAN MASQUERADE'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {magicResult.threatDetails || `Detected signature (${magicResult.detectedSignature}) strictly conforms to .${magicResult.declaredExtension} file type standards.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
