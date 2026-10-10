import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { DiffModal } from './components/DiffModal';
import { MonitorView } from './components/MonitorView';
import { ValidationLabView } from './components/ValidationLabView';
import { AuditLogsView } from './components/AuditLogsView';
import { AwarenessView } from './components/AwarenessView';
import { TestSuiteView } from './components/TestSuiteView';
import { SubmissionDossierView } from './components/SubmissionDossierView';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { 
  MonitoredFile, 
  BaselineSnapshot, 
  AuditLog, 
  UserSession, 
  HashAlgorithm, 
  SeverityLevel 
} from './types/fim';
import { INITIAL_FILES_DATA } from './data/defaultFiles';
import { computeAllHashes, computeHash, createLogSeal } from './utils/crypto';
import { generateProjectPDF } from './utils/pdfGenerator';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('monitor');
  const [algo, setAlgo] = useState<HashAlgorithm>('SHA-256');
  const [isScanning, setIsScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [inspectingFile, setInspectingFile] = useState<MonitoredFile | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Authenticated Session
  const [session, setSession] = useState<UserSession>({
    username: 'sec_admin',
    fullName: 'Alex Vance (Lead SecOps)',
    email: 'alex.vance@defense.soc',
    role: 'admin',
    token: 'aegis_jwt_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.admin_token',
    mfaVerified: true,
    loginTime: new Date().toISOString()
  });

  // State: Files, Baseline, Logs, Tests
  const [files, setFiles] = useState<MonitoredFile[]>([]);
  const [baseline, setBaseline] = useState<BaselineSnapshot | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [testsPassedCount, setTestsPassedCount] = useState(12);
  const [totalTestsCount, setTotalTestsCount] = useState(12);

  // Reference to avoid stale closures in watchdog
  const filesRef = useRef(files);
  filesRef.current = files;
  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;
  const logsRef = useRef(logs);
  logsRef.current = logs;

  // Initialize files and baseline on startup
  useEffect(() => {
    const initSystem = async () => {
      const initializedFiles: MonitoredFile[] = [];

      for (const item of INITIAL_FILES_DATA) {
        const hashes = await computeAllHashes(item.content);
        initializedFiles.push({
          ...item,
          hashes,
          baselineHashes: { ...hashes },
          baselineSize: item.size,
          baselinePermissions: item.permissions,
          status: 'NOMINAL',
          isTampered: false
        });
      }

      setFiles(initializedFiles);

      // Create initial baseline snapshot
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      const records: BaselineSnapshot['records'] = {};
      let aggregateData = '';

      initializedFiles.forEach(f => {
        records[f.path] = {
          hash: f.hashes['SHA-256'],
          size: f.size,
          permissions: f.permissions,
          lastModified: f.lastModified
        };
        aggregateData += `${f.path}:${f.hashes['SHA-256']};`;
      });

      const snapshotSeal = await computeHash(aggregateData, 'SHA-256');

      const initialBaseline: BaselineSnapshot = {
        id: 'BL-SNAPSHOT-GENESIS-01',
        version: '1.0-genesis',
        timestamp,
        createdBy: 'Alex Vance (sec_admin)',
        algorithm: 'SHA-256',
        fileCount: initializedFiles.length,
        records,
        snapshotSeal
      };

      setBaseline(initialBaseline);

      // Initial genesis audit log
      const log1Hash = await createLogSeal('00000000000000000000000000000000', 'EVT-INIT-001', timestamp, 'SYSTEM_INITIALIZED', 'AegisFIM core engine started with Web Crypto API');
      const log2Hash = await createLogSeal(log1Hash, 'EVT-BASE-002', timestamp, 'BASELINE_COMMITTED', `Golden baseline captured: 6 system files sealed (${snapshotSeal.substring(0, 16)}...)`);

      setLogs([
        {
          id: 'log-2',
          eventId: 'EVT-BASE-002',
          timestamp,
          severity: 'INFO',
          action: 'BASELINE_COMMITTED',
          actor: 'sec_admin',
          target: 'Catalog Root',
          details: `Golden baseline snapshot established with SHA-256 digital seal`,
          prevHash: log1Hash,
          logHash: log2Hash
        },
        {
          id: 'log-1',
          eventId: 'EVT-INIT-001',
          timestamp,
          severity: 'INFO',
          action: 'SYSTEM_INITIALIZED',
          actor: 'system',
          target: 'FIM Daemon',
          details: 'Initialized cryptographic monitoring engine and input validation guard',
          prevHash: '00000000000000000000000000000000',
          logHash: log1Hash
        }
      ]);
    };

    initSystem();
  }, []);

  // Helper to append a cryptographically chained audit log
  const addAuditLog = async (
    severity: SeverityLevel,
    action: string,
    actor: string,
    target: string,
    details: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const eventId = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentLogs = logsRef.current;
    const prevHash = currentLogs.length > 0 ? currentLogs[0].logHash : '00000000000000000000000000000000';
    const logHash = await createLogSeal(prevHash, eventId, timestamp, action, details);

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      timestamp,
      severity,
      action,
      actor,
      target,
      details,
      prevHash,
      logHash
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Run integrity scan
  const handleRunScan = async () => {
    setIsScanning(true);
    const activeBaseline = baselineRef.current;

    await new Promise(r => setTimeout(r, 450)); // Realism delay

    let tamperFound = 0;
    const updatedFiles = await Promise.all(
      filesRef.current.map(async (file) => {
        if (file.status === 'DELETED') {
          tamperFound++;
          return file;
        }

        const freshHashes = await computeAllHashes(file.content);
        const baselineHash = file.baselineHashes?.[algo];
        const currentHash = freshHashes[algo];

        let newStatus = file.status;
        let isTampered = file.isTampered;

        if (file.status !== 'ADDED') {
          if (baselineHash && baselineHash !== currentHash) {
            newStatus = 'MODIFIED';
            isTampered = true;
            tamperFound++;
          } else if (file.baselinePermissions && file.baselinePermissions !== file.permissions) {
            newStatus = 'PERM_DRIFT';
            isTampered = true;
            tamperFound++;
          } else {
            newStatus = 'NOMINAL';
            isTampered = false;
          }
        }

        return {
          ...file,
          hashes: freshHashes,
          status: newStatus,
          isTampered
        };
      })
    );

    setFiles(updatedFiles);
    setIsScanning(false);

    if (tamperFound > 0) {
      await addAuditLog(
        'HIGH',
        'INTEGRITY_SCAN_ALERT',
        session.username,
        `${tamperFound} Assets`,
        `Integrity scan detected ${tamperFound} anomalies (hash mismatch or permissions drift)`
      );
      showToast(`Scan complete: ${tamperFound} file integrity anomalies detected!`, 'error');
    } else {
      await addAuditLog(
        'INFO',
        'INTEGRITY_SCAN_NOMINAL',
        session.username,
        `${updatedFiles.length} Assets`,
        `Integrity scan completed with 100% nominal match against baseline`
      );
      showToast(`Scan complete: All ${updatedFiles.length} files verified pristine.`, 'success');
    }
  };

  // Periodic Watchdog Auto-Scan (every 10s if enabled)
  useEffect(() => {
    if (!autoScanEnabled) return;
    const interval = setInterval(() => {
      handleRunScan();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoScanEnabled, algo, session.username]);

  // Capture Golden Baseline Snapshot (RBAC guarded: Admin only!)
  const handleCaptureBaseline = async () => {
    if (session.role !== 'admin') {
      await addAuditLog(
        'HIGH',
        'UNAUTHORIZED_BASELINE_ATTEMPT',
        session.username,
        'Baseline Vault',
        `User with role "${session.role}" attempted to overwrite baseline without administrator authority (denied by RBAC policy guard)`
      );
      showToast(`Permission Denied: Administrator role required to commit baseline snapshots.`, 'error');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const records: BaselineSnapshot['records'] = {};
    let aggregateData = '';

    const pristineFiles = await Promise.all(
      files.map(async (file) => {
        const freshHashes = await computeAllHashes(file.content);
        records[file.path] = {
          hash: freshHashes['SHA-256'],
          size: file.size,
          permissions: file.permissions,
          lastModified: timestamp
        };
        aggregateData += `${file.path}:${freshHashes['SHA-256']};`;

        return {
          ...file,
          hashes: freshHashes,
          baselineHashes: { ...freshHashes },
          baselineSize: file.size,
          baselinePermissions: file.permissions,
          status: 'NOMINAL' as const,
          isTampered: false,
          tamperDetails: undefined
        };
      })
    );

    const snapshotSeal = await computeHash(aggregateData, 'SHA-256');
    const newVersion = `v${(files.length + 1) * 0.1 + 1.0}`.substring(0, 4);

    const newSnapshot: BaselineSnapshot = {
      id: `BL-SNAPSHOT-${Date.now().toString(36).toUpperCase()}`,
      version: newVersion,
      timestamp,
      createdBy: `${session.fullName} (${session.username})`,
      algorithm: 'SHA-256',
      fileCount: pristineFiles.length,
      records,
      snapshotSeal
    };

    setFiles(pristineFiles);
    setBaseline(newSnapshot);

    await addAuditLog(
      'INFO',
      'BASELINE_REBASE_COMMITTED',
      session.username,
      `${pristineFiles.length} Assets`,
      `New golden baseline snapshot committed under seal: ${snapshotSeal.substring(0, 16)}...`
    );
    showToast(`Golden baseline snapshot ${newVersion} captured and digitally sealed!`, 'success');
  };

  // Simulate adversary tampering
  const handleSimulateTamper = async (fileId: string, tamperType: 'bitflip' | 'backdoor' | 'permissions' | 'delete') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    let updatedFiles: MonitoredFile[] = [];
    let logSeverity: SeverityLevel = 'HIGH';
    let logAction = 'FILE_TAMPER_SIMULATED';
    let logDetails = '';

    if (tamperType === 'bitflip') {
      // Modify single character
      const modifiedContent = file.content.length > 5 
        ? file.content.substring(0, 5) + (file.content[5] === 'X' ? 'Y' : 'X') + file.content.substring(6)
        : file.content + '!';
      const newHashes = await computeAllHashes(modifiedContent);

      updatedFiles = files.map(f => f.id === fileId ? {
        ...f,
        content: modifiedContent,
        hashes: newHashes,
        status: 'MODIFIED',
        isTampered: true,
        tamperDetails: 'Adversary modified exactly 1 byte. Cryptographic hash flipped over 50% of output bits (Avalanche Effect).'
      } : f);

      logSeverity = 'HIGH';
      logAction = 'TAMPER_BITFLIP_INJECTED';
      logDetails = `Single-byte bit flip injected into ${file.path}. Live hash drifted from baseline.`;
    } else if (tamperType === 'backdoor') {
      // Inject webshell
      const webshell = '\n\n/* ADVERSARY PERSISTENCE PAYLOAD */\n<?php if(isset($_GET["cmd"])) { system($_GET["cmd"]); exit; } ?>';
      const modifiedContent = file.content + webshell;
      const newHashes = await computeAllHashes(modifiedContent);

      updatedFiles = files.map(f => f.id === fileId ? {
        ...f,
        content: modifiedContent,
        size: modifiedContent.length,
        hashes: newHashes,
        status: 'MODIFIED',
        isTampered: true,
        tamperDetails: 'Critical backdoor webshell payload appended (system command execution exploit).'
      } : f);

      logSeverity = 'CRITICAL';
      logAction = 'MALICIOUS_WEBSHELL_INJECTED';
      logDetails = `Adversary webshell injected into ${file.path} (MITRE ATT&CK T1505 Server Software Component)`;
    } else if (tamperType === 'permissions') {
      // Drift permissions to 0777
      updatedFiles = files.map(f => f.id === fileId ? {
        ...f,
        permissions: '0777',
        status: 'PERM_DRIFT',
        isTampered: true,
        tamperDetails: 'Privilege escalation risk: Permissions drifted from secure 0600/0644 to world-writable 0777.'
      } : f);

      logSeverity = 'HIGH';
      logAction = 'PERMISSIONS_DRIFT_ESCALATED';
      logDetails = `Permissions for ${file.path} altered to 0777 (world-writable security breach)`;
    } else if (tamperType === 'delete') {
      // Deletion
      updatedFiles = files.map(f => f.id === fileId ? {
        ...f,
        status: 'DELETED',
        isTampered: true,
        tamperDetails: 'Critical enrolled baseline file deleted from filesystem (unauthorized destruction).'
      } : f);

      logSeverity = 'CRITICAL';
      logAction = 'FILE_DESTRUCTION_DETECTED';
      logDetails = `Critical file ${file.path} removed from filesystem (Ransomware or insider destruction)`;
    }

    setFiles(updatedFiles);
    await addAuditLog(logSeverity, logAction, 'Simulated Adversary', file.path, logDetails);
    showToast(`Tamper injected: ${file.path} flagged in integrity table!`, 'error');
  };

  // Restore file to baseline pristine state
  const handleRestoreFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Retrieve pristine definition or baseline
    const initialItem = INITIAL_FILES_DATA.find(i => i.id === fileId);
    const restoredContent = initialItem ? initialItem.content : file.content;
    const restoredPerms = file.baselinePermissions || (initialItem ? initialItem.permissions : '0644');
    const freshHashes = await computeAllHashes(restoredContent);

    const updated = files.map(f => f.id === fileId ? {
      ...f,
      content: restoredContent,
      permissions: restoredPerms,
      size: restoredContent.length,
      hashes: freshHashes,
      status: 'NOMINAL' as const,
      isTampered: false,
      tamperDetails: undefined
    } : f);

    setFiles(updated);
    await addAuditLog('INFO', 'FILE_RESTORED_TO_BASELINE', session.username, file.path, `File restored to golden baseline state`);
    showToast(`File ${file.path} restored to verified baseline!`, 'success');
  };

  // Add custom simulated asset
  const handleAddCustomFile = async (path: string, content: string, permissions: string) => {
    const hashes = await computeAllHashes(content);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const newFile: MonitoredFile = {
      id: `f-${Date.now()}`,
      path,
      name: path.split('/').pop() || 'custom.file',
      category: 'user',
      content,
      size: content.length,
      permissions,
      owner: 'root:secops',
      lastModified: timestamp,
      hashes,
      baselineHashes: { ...hashes },
      baselineSize: content.length,
      baselinePermissions: permissions,
      status: 'NOMINAL',
      isTampered: false
    };

    setFiles(prev => [newFile, ...prev]);
    await addAuditLog('INFO', 'ASSET_ENROLLED', session.username, path, `Enrolled custom asset into cryptographic monitoring`);
    showToast(`Enrolled ${path} into integrity monitor`, 'success');
  };

  // Real local file upload
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const textDecoder = new TextDecoder();
      let textContent = '';
      try {
        textContent = textDecoder.decode(buffer);
      } catch {
        textContent = `[Binary file: ${file.name}, size: ${file.size} bytes]`;
      }

      const hashes = await computeAllHashes(buffer);
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

      const newFile: MonitoredFile = {
        id: `upload-${Date.now()}`,
        path: `/var/uploads/${file.name}`,
        name: file.name,
        category: 'user',
        content: textContent,
        size: file.size,
        permissions: '0644',
        owner: 'user:local',
        lastModified: timestamp,
        hashes,
        baselineHashes: { ...hashes },
        baselineSize: file.size,
        baselinePermissions: '0644',
        status: 'NOMINAL',
        isTampered: false
      };

      setFiles(prev => [newFile, ...prev]);
      await addAuditLog('INFO', 'REAL_FILE_UPLOADED', session.username, file.name, `Uploaded real local file (${file.size} bytes), calculated Web Crypto SHA-256 seal`);
      showToast(`Real file "${file.name}" uploaded and hashed with SHA-256!`, 'success');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleQuickDownloadPDF = async () => {
    const payload = `${session.fullName}|CYBER-INT-2026-8841|Cybersecurity Virtual Internship Academy|${new Date().toISOString().substring(0, 10)}|tests:${testsPassedCount}/${totalTestsCount}|base:${baseline?.snapshotSeal || 'none'}`;
    const seal = await computeHash(payload, 'SHA-256');

    generateProjectPDF({
      candidateName: session.fullName,
      candidateId: 'CYBER-INT-2026-8841',
      institution: 'Cybersecurity Virtual Internship Academy',
      mentorName: 'Dr. Marcus Reyes, CISSP (SOC Operations)',
      submissionDate: new Date().toISOString().substring(0, 10),
      dossierSeal: seal,
      baseline,
      files,
      logs,
      testsPassed: testsPassedCount,
      totalTests: totalTestsCount
    });

    showToast('Virtual Internship Project PDF generated and downloaded!', 'success');
  };

  const tamperCount = files.filter(f => f.status === 'MODIFIED' || f.status === 'PERM_DRIFT' || f.status === 'DELETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-2.5 rounded-lg border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-950 text-emerald-200 border-emerald-800' :
            notification.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-800' :
            'bg-slate-900 text-cyan-300 border-cyan-800'
          }`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onRunScan={handleRunScan}
        onDownloadPDF={handleQuickDownloadPDF}
        onOpenGitHub={() => setIsGitHubModalOpen(true)}
        isScanning={isScanning}
        tamperCount={tamperCount}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'monitor' && (
          <MonitorView
            files={files}
            baseline={baseline}
            algo={algo}
            onAlgoChange={setAlgo}
            session={session}
            onCaptureBaseline={handleCaptureBaseline}
            onSimulateTamper={handleSimulateTamper}
            onRestoreFile={handleRestoreFile}
            onInspectFile={(f) => setInspectingFile(f)}
            onAddCustomFile={handleAddCustomFile}
            onFileUpload={handleFileUpload}
            autoScanEnabled={autoScanEnabled}
            onToggleAutoScan={() => setAutoScanEnabled(!autoScanEnabled)}
          />
        )}

        {currentTab === 'validation' && (
          <ValidationLabView />
        )}

        {currentTab === 'audit' && (
          <AuditLogsView logs={logs} />
        )}

        {currentTab === 'awareness' && (
          <AwarenessView />
        )}

        {currentTab === 'tests' && (
          <TestSuiteView
            onTestRunComplete={(passed, total) => {
              setTestsPassedCount(passed);
              setTotalTestsCount(total);
              showToast(`Test suite run completed: ${passed}/${total} passed!`, 'success');
            }}
          />
        )}

        {currentTab === 'submission' && (
          <SubmissionDossierView
            baseline={baseline}
            files={files}
            logs={logs}
            testsPassed={testsPassedCount}
            totalTests={totalTestsCount}
            onOpenGitHub={() => setIsGitHubModalOpen(true)}
          />
        )}
      </main>

      {/* Diff Inspection Modal */}
      <DiffModal
        file={inspectingFile}
        algo={algo}
        onClose={() => setInspectingFile(null)}
        onRestore={handleRestoreFile}
      />

      {/* RBAC Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        onUpdateSession={(newSession) => {
          setSession(newSession);
          showToast(`Switched active session to: ${newSession.role} (${newSession.username})`, 'info');
        }}
      />

      {/* GitHub Sync & Export Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
}

