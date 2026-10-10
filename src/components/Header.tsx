import React, { useState } from 'react';
import { Shield, ShieldAlert, Key, UserCheck, RefreshCw, Lock, Sparkles, Terminal, FileText, Github } from 'lucide-react';
import { UserSession, UserRole } from '../types/fim';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  session: UserSession;
  onOpenAuth: () => void;
  onRunScan: () => void;
  onDownloadPDF?: () => void;
  onOpenGitHub?: () => void;
  isScanning: boolean;
  tamperCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  session,
  onOpenAuth,
  onRunScan,
  onDownloadPDF,
  onOpenGitHub,
  isScanning,
  tamperCount
}) => {
  const roleBadgeColors: Record<UserRole, string> = {
    admin: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    analyst: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    auditor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
  };

  const navItems = [
    { id: 'monitor', label: 'Integrity Vault' },
    { id: 'validation', label: 'Input Validation Lab' },
    { id: 'audit', label: 'Audit Logs & SIEM' },
    { id: 'awareness', label: 'Security Awareness' },
    { id: 'tests', label: 'Automated Test Suite' },
    { id: 'submission', label: 'Project Submission' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-mono">
                AegisFIM
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Cybersecurity Virtual Internship
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.label}
                {item.id === 'monitor' && tamperCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono">
                    {tamperCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick GitHub Sync Button */}
          {onOpenGitHub && (
            <button
              onClick={onOpenGitHub}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
              title="Add project to your GitHub repository"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span>GitHub</span>
            </button>
          )}

          {/* Quick PDF Report Download Button */}
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
              title="Download 4-page Virtual Internship Project Report PDF"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project PDF</span>
            </button>
          )}

          {/* Role & Auth trigger */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${roleBadgeColors[session.role]}`}
            title="Manage Authentication & Role Permissions"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="capitalize">{session.role}</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              ({session.username})
            </span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Integrity Scan'}</span>
          </button>
        </div>
      </div>


      {/* Mobile Nav Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1 pt-2 mt-2 border-t border-slate-900 pb-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
              {item.id === 'monitor' && tamperCount > 0 && (
                <span className="ml-1 px-1 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300">
                  {tamperCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
