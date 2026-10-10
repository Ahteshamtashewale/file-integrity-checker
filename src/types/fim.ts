export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5';

export type FileStatus = 'NOMINAL' | 'MODIFIED' | 'ADDED' | 'DELETED' | 'PERM_DRIFT';

export type UserRole = 'admin' | 'analyst' | 'auditor';

export type SeverityLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserSession {
  username: string;
  role: UserRole;
  fullName: string;
  email: string;
  token: string;
  mfaVerified: boolean;
  loginTime: string;
}

export interface MonitoredFile {
  id: string;
  path: string;
  name: string;
  category: 'system' | 'web' | 'config' | 'binary' | 'user';
  content: string;
  size: number;
  permissions: string;
  owner: string;
  lastModified: string;
  hashes: Record<HashAlgorithm, string>;
  baselineHashes?: Record<HashAlgorithm, string>;
  baselineSize?: number;
  baselinePermissions?: string;
  status: FileStatus;
  isTampered?: boolean;
  tamperDetails?: string;
}

export interface BaselineSnapshot {
  id: string;
  timestamp: string;
  version: string;
  createdBy: string;
  algorithm: HashAlgorithm;
  fileCount: number;
  records: Record<string, {
    hash: string;
    size: number;
    permissions: string;
    lastModified: string;
  }>;
  snapshotSeal: string;
}

export interface AuditLog {
  id: string;
  eventId: string;
  timestamp: string;
  severity: SeverityLevel;
  action: string;
  actor: string;
  target: string;
  details: string;
  prevHash: string;
  logHash: string;
}

export interface TestCase {
  id: string;
  category: 'Cryptography' | 'Input Validation' | 'Integrity Detection' | 'Access Control' | 'Audit Compliance';
  title: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  details?: string;
  logs?: string[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface ValidationTestResult {
  input: string;
  inputType: 'path' | 'hash' | 'magic_byte' | 'size';
  sanitized: string;
  isValid: boolean;
  threatDetected?: string;
  checks: ValidationCheck[];
  securityNote: string;
}

export interface InternshipDossier {
  candidateName: string;
  candidateId: string;
  institution: string;
  mentor: string;
  submissionDate: string;
  projectVersion: string;
  testPassedCount: number;
  totalTests: number;
  baselineSnapshotId: string;
  integrityScore: number;
  status: 'DRAFT' | 'READY' | 'SUBMITTED';
}
