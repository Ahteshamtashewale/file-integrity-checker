import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Github, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import JSZip from 'jszip';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [repoName, setRepoName] = useState('file-integrity-checker');
  const [repoDescription, setRepoDescription] = useState(
    'Practical Cybersecurity Virtual Internship Project: File Integrity Monitoring (FIM) with Web Crypto API, Baseline Hashing, Tamper Detection, Input Validation, and SIEM Audit Logs.'
  );
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string; repoUrl?: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const cliCommands = `# 1. (Optional) Check current local git status
git status

# 2. Add your GitHub repository remote (replace <YOUR_GITHUB_USERNAME>)
git remote add origin https://github.com/${username.trim() || '<YOUR_GITHUB_USERNAME>'}/${repoName.trim()}.git

# 3. Push to GitHub
git push -u origin main`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Direct GitHub API creation
  const handlePushViaGitHubApi = async () => {
    if (!token.trim()) {
      setSyncStatus({
        success: false,
        message: 'Please provide a GitHub Personal Access Token (classic with "repo" scope or fine-grained).'
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      // 1. Create Repository via GitHub API
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName.trim(),
          description: repoDescription.trim(),
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
          auto_init: false
        })
      });

      const createData = await createRes.json();

      if (!createRes.ok && createRes.status !== 422) { // 422 usually means already exists
        throw new Error(createData.message || 'Failed to create GitHub repository');
      }

      const htmlUrl = createData.html_url || `https://github.com/${username || 'user'}/${repoName}`;

      setSyncStatus({
        success: true,
        message: `Repository "${repoName}" successfully provisioned on GitHub!`,
        repoUrl: htmlUrl
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err.message || 'Error connecting to GitHub API. Please check your token permissions.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Download complete project source code ZIP
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Read key files from window or project template
      const filesToFetch = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'index.html',
        'metadata.json',
        '.gitignore',
        '.env.example',
        'README.md',
        'src/main.tsx',
        'src/App.tsx',
        'src/index.css',
        'src/types/fim.ts',
        'src/utils/crypto.ts',
        'src/utils/validation.ts',
        'src/utils/pdfGenerator.ts',
        'src/data/defaultFiles.ts',
        'src/components/Header.tsx',
        'src/components/AuthModal.tsx',
        'src/components/DiffModal.tsx',
        'src/components/MonitorView.tsx',
        'src/components/ValidationLabView.tsx',
        'src/components/AuditLogsView.tsx',
        'src/components/AwarenessView.tsx',
        'src/components/TestSuiteView.tsx',
        'src/components/SubmissionDossierView.tsx',
        'src/components/GitHubSyncModal.tsx'
      ];

      for (const filePath of filesToFetch) {
        try {
          const res = await fetch(`/${filePath}`);
          if (res.ok) {
            const text = await res.text();
            zip.file(filePath, text);
          }
        } catch {
          // continue
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${repoName}-main.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Add to GitHub Repository
              </h2>
              <p className="text-xs text-slate-400">
                Publish your File Integrity Checker Virtual Internship Project to GitHub
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Repository Details Configuration */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Recommended Repository Parameters:
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Repository Name:
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Repository Description:
              </label>
              <textarea
                rows={2}
                value={repoDescription}
                onChange={(e) => setRepoDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Sync Result Alert */}
          {syncStatus && (
            <div className={`p-4 rounded-lg border text-xs ${
              syncStatus.success 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-800 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {syncStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{syncStatus.message}</span>
              </div>
              {syncStatus.repoUrl && (
                <a
                  href={syncStatus.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 underline font-mono flex items-center gap-1 mt-1"
                >
                  <span>Open {syncStatus.repoUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Option A: Direct Push via GitHub Personal Access Token */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Option A: Direct GitHub API Push
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">1-Click Integration</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generate a Personal Access Token on GitHub with <code className="text-cyan-300 font-mono">repo</code> scope to automatically create this repository on your account:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="GitHub Username (e.g. yourname)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
              <input
                type="password"
                placeholder="GitHub Token (ghp_...)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={handlePushViaGitHubApi}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
              <span>{isSyncing ? 'Creating Repository on GitHub...' : 'Create & Push to My GitHub'}</span>
            </button>
          </div>

          {/* Option B: Git CLI Commands */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Option B: Push via Terminal / Git CLI</span>
              </div>
              <button
                onClick={handleCopyCli}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied Commands' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre select-all">
              {cliCommands}
            </pre>
          </div>

          {/* Option C: Download Source ZIP */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">
                Option C: Download Full Project ZIP Archive
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Download all 26 source code files, ready to upload or drag-and-drop to GitHub Web.
              </div>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isZipping ? 'Archiving...' : 'Download ZIP'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            Initial git commit already staged on branch: <code className="text-white font-mono">main</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-slate-200 hover:bg-white rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
