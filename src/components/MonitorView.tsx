import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  FileCode, 
  Binary, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Upload, 
  Clock, 
  Lock,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { MonitoredFile, BaselineSnapshot, HashAlgorithm, UserSession } from '../types/fim';
import { formatBytes } from '../utils/crypto';

interface MonitorViewProps {
  files: MonitoredFile[];
  baseline: BaselineSnapshot | null;
  algo: HashAlgorithm;
  onAlgoChange: (algo: HashAlgorithm) => void;
  session: UserSession;
  onCaptureBaseline: () => void;
  onSimulateTamper: (fileId: string, tamperType: 'bitflip' | 'backdoor' | 'permissions' | 'delete') => void;
  onRestoreFile: (fileId: string) => void;
  onInspectFile: (file: MonitoredFile) => void;
  onAddCustomFile: (path: string, content: string, permissions: string) => void;
  onFileUpload: (file: File) => void;
  autoScanEnabled: boolean;
  onToggleAutoScan: () => void;
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  files,
  baseline,
  algo,
  onAlgoChange,
  session,
  onCaptureBaseline,
  onSimulateTamper,
  onRestoreFile,
  onInspectFile,
  onAddCustomFile,
  onFileUpload,
  autoScanEnabled,
  onToggleAutoScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPath, setNewPath] = useState('/etc/security/fim_rules.conf');
  const [newContent, setNewContent] = useState('audit_watch = /etc\nalgorithm = SHA256\nrate_limit = 100/min');
  const [newPermissions, setNewPermissions] = useState('0640');
  const [tamperTargetFile, setTamperTargetFile] = useState<MonitoredFile | null>(null);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const modifiedCount = files.filter(f => f.status === 'MODIFIED' || f.status === 'PERM_DRIFT').length;
  const nominalCount = files.filter(f => f.status === 'NOMINAL').length;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;
    onAddCustomFile(newPath.trim(), newContent, newPermissions);
    setShowAddModal(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Baseline Snapshot Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Baseline Snapshot Vault
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {baseline ? `Version ${baseline.version}` : 'No Baseline Captured'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Digital Snapshot Seal:</span>
              <span className="font-mono text-cyan-300 text-[11px] truncate max-w-xs md:max-w-md select-all">
                {baseline ? baseline.snapshotSeal : 'Pending baseline initialization'}
              </span>
            </div>
            {baseline && (
              <div className="text-[11px] text-slate-500">
                Created by <strong className="text-slate-400">{baseline.createdBy}</strong> at {baseline.timestamp}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCaptureBaseline}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                session.role === 'admin'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm'
                  : 'bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title={session.role !== 'admin' ? 'Administrator role required to commit baseline snapshots' : 'Take snapshot'}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Capture Baseline Snapshot</span>
              {session.role !== 'admin' && (
                <span className="text-[10px] text-rose-400 font-mono">(Admin Only)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Control Strip & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1">Monitored Assets</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {files.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Cryptographic tracking active
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1">Integrity Status</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {nominalCount} Nominal
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Hashes match golden baseline
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1">Tamper Alerts</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${modifiedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {modifiedCount} Detected
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {modifiedCount > 0 ? 'Immediate investigation needed' : 'Zero deviations detected'}
          </div>
        </div>

        {/* Metric 4: Hash Algorithm Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Algorithm</span>
            <span className="text-[10px] text-cyan-400 font-mono">Web Crypto</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {(['SHA-256', 'SHA-512', 'SHA-1', 'MD5'] as HashAlgorithm[]).map((a) => (
              <button
                key={a}
                onClick={() => onAlgoChange(a)}
                className={`py-1 text-[11px] font-mono font-medium rounded transition-colors ${
                  algo === a
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {a.replace('SHA-', '')}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {algo === 'MD5' ? '⚠️ MD5 has collision flaws' : `${algo} cryptographic standard`}
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Filters, AutoScan, Upload & Add */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter files by path or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="system">System (/etc)</option>
            <option value="config">Configurations</option>
            <option value="web">Web Application</option>
            <option value="binary">Binaries</option>
            <option value="user">User Files</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="NOMINAL">Nominal (Match)</option>
            <option value="MODIFIED">Modified (Tampered)</option>
            <option value="ADDED">Added (Rogue)</option>
            <option value="DELETED">Deleted (Missing)</option>
            <option value="PERM_DRIFT">Permission Drift</option>
          </select>

          {/* Auto Scan Toggle */}
          <button
            onClick={onToggleAutoScan}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              autoScanEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Automatically run integrity checks periodically"
          >
            <Clock className={`w-3.5 h-3.5 ${autoScanEnabled ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>Auto-Scan {autoScanEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Upload Real File */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-md text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Real File</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* Add Custom File */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File</span>
          </button>
        </div>
      </div>

      {/* Monitored Files Table */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-medium">File Path &amp; Name</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Permissions</th>
                <th className="py-3 px-4 font-medium">Size</th>
                <th className="py-3 px-4 font-medium">Live Hash ({algo})</th>
                <th className="py-3 px-4 font-medium">Integrity Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No files match current filter criteria. Drag and drop any local file here to begin monitoring.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => {
                  const currentHash = file.hashes[algo];
                  const baselineHash = file.baselineHashes?.[algo];
                  const isModified = file.status === 'MODIFIED' || file.status === 'PERM_DRIFT';
                  const isNominal = file.status === 'NOMINAL';

                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        isModified ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Path & Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-xs">{file.path}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          Modified: {file.lastModified}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300 font-sans capitalize">
                        {file.category}
                      </td>

                      {/* Permissions */}
                      <td className="py-3 px-4">
                        <span className={file.permissions === '0777' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {file.permissions}
                        </span>
                        {file.baselinePermissions && file.baselinePermissions !== file.permissions && (
                          <span className="text-[10px] text-rose-400 block font-sans">
                            (was {file.baselinePermissions})
                          </span>
                        )}
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 text-slate-300 tabular-nums">
                        {formatBytes(file.size)}
                      </td>

                      {/* Hash Preview */}
                      <td className="py-3 px-4 text-slate-300 max-w-[200px]">
                        <div className="truncate text-[11px] text-cyan-300" title={currentHash}>
                          {currentHash}
                        </div>
                        {baselineHash && baselineHash !== currentHash && (
                          <div className="truncate text-[10px] text-slate-500" title={`Baseline: ${baselineHash}`}>
                            Base: {baselineHash.substring(0, 16)}...
                          </div>
                        )}
                      </td>

                      {/* Integrity Status */}
                      <td className="py-3 px-4 font-sans">
                        {file.status === 'NOMINAL' && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Nominal</span>
                          </span>
                        )}
                        {file.status === 'MODIFIED' && (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Tampered</span>
                          </span>
                        )}
                        {file.status === 'PERM_DRIFT' && (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Perms Drift</span>
                          </span>
                        )}
                        {file.status === 'ADDED' && (
                          <span className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Rogue File</span>
                          </span>
                        )}
                        {file.status === 'DELETED' && (
                          <span className="inline-flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Missing</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Diff */}
                          <button
                            onClick={() => onInspectFile(file)}
                            className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                            title="Inspect Cryptographic Diff & Avalanche Effect"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tamper Simulator Trigger */}
                          <button
                            onClick={() => setTamperTargetFile(file)}
                            className="px-2 py-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950 border border-amber-800/80 rounded transition-colors"
                            title="Simulate adversary altering this file"
                          >
                            Simulate Tamper
                          </button>

                          {/* Restore */}
                          {file.isTampered && (
                            <button
                              onClick={() => onRestoreFile(file.id)}
                              className="p-1.5 rounded text-emerald-400 hover:bg-emerald-950/60 transition-colors"
                              title="Restore to baseline pristine state"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamper Simulator Modal */}
      {tamperTargetFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Adversary Tampering Simulator</h3>
              </div>
              <button
                onClick={() => setTamperTargetFile(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Target Asset: <strong className="font-mono text-cyan-300">{tamperTargetFile.path}</strong>. Select a simulated cybersecurity attack method to observe how cryptographic hashing catches the tampering instantly:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onSimulateTamper(tamperTargetFile.id, 'bitflip');
                  setTamperTargetFile(null);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="text-xs font-semibold text-white mb-0.5">
                  1. Single-Byte Bit Flip (Subtle Modification)
                </div>
                <div className="text-[11px] text-slate-400">
                  Modifies exactly 1 byte in the file. Demonstrates the cryptographic Avalanche Effect (&gt;50% hash bit shift).
                </div>
              </button>

              <button
                onClick={() => {
                  onSimulateTamper(tamperTargetFile.id, 'backdoor');
                  setTamperTargetFile(null);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="text-xs font-semibold text-rose-400 mb-0.5">
                  2. Malicious Webshell / Backdoor Injection
                </div>
                <div className="text-[11px] text-slate-400">
                  Appends a command execution payload (e.g. `system($_GET['cmd'])`). Drastically changes hash and file size.
                </div>
              </button>

              <button
                onClick={() => {
                  onSimulateTamper(tamperTargetFile.id, 'permissions');
                  setTamperTargetFile(null);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="text-xs font-semibold text-amber-400 mb-0.5">
                  3. Permission Drift Escalation (chmod 0777)
                </div>
                <div className="text-[11px] text-slate-400">
                  Changes access permissions from restrictive 0600 to world-writable 0777. Content remains intact but metadata integrity fails.
                </div>
              </button>

              <button
                onClick={() => {
                  onSimulateTamper(tamperTargetFile.id, 'delete');
                  setTamperTargetFile(null);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="text-xs font-semibold text-red-500 mb-0.5">
                  4. File Deletion (Unauthorized Destruction)
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulates ransomware or malicious insider purging a critical system file.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Monitored File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCustomSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Monitored Asset</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                File System Path:
              </label>
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Permissions (Octal):
                </label>
                <input
                  type="text"
                  value={newPermissions}
                  onChange={(e) => setNewPermissions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-end">
                <span className="text-[11px] text-slate-500 mb-2">
                  e.g. 0644 (Read/Write Owner, Read Others)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Initial File Contents:
              </label>
              <textarea
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
              >
                Enroll Asset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
