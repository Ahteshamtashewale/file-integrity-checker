import { MonitoredFile } from '../types/fim';

export interface AwarenessModule {
  id: string;
  title: string;
  standard: string;
  badge: string;
  overview: string;
  keyPoints: string[];
  threatScenario: {
    title: string;
    description: string;
    detectionMethod: string;
    impact: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
}

export const INITIAL_FILES_DATA: Omit<MonitoredFile, 'hashes' | 'status'>[] = [
  {
    id: 'f-1',
    path: '/etc/nginx/nginx.conf',
    name: 'nginx.conf',
    category: 'config',
    content: `user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server_tokens off; # Hardened header
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}`,
    size: 472,
    permissions: '0644',
    owner: 'root:root',
    lastModified: '2026-10-09 14:22:10 UTC'
  },
  {
    id: 'f-2',
    path: '/etc/shadow',
    name: 'shadow',
    category: 'system',
    content: `root:$6$rounds=50000$q8Zk4Lm!90xP$V7Xk5Z1zOaP4:19800:0:90:7:::
daemon:*:19800:0:99999:7:::
bin:*:19800:0:99999:7:::
sys:*:19800:0:99999:7:::
secops:$6$rounds=50000$hT76!9L$89JkJlK3l21oP:19800:0:90:7:::`,
    size: 204,
    permissions: '0600',
    owner: 'root:shadow',
    lastModified: '2026-10-08 09:15:33 UTC'
  },
  {
    id: 'f-3',
    path: '/etc/ssh/sshd_config',
    name: 'sshd_config',
    category: 'config',
    content: `# SSH Daemon Security Configuration
Port 2222
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowGroups ssh-users wheel`,
    size: 248,
    permissions: '0600',
    owner: 'root:root',
    lastModified: '2026-10-07 18:40:02 UTC'
  },
  {
    id: 'f-4',
    path: '/var/www/production/app/config.json',
    name: 'config.json',
    category: 'web',
    content: `{
  "app_environment": "production",
  "auth_provider": "OIDC_Enterprise",
  "jwt_algorithm": "RS256",
  "token_ttl_seconds": 3600,
  "tls_min_version": "TLSv1.3",
  "audit_logging_enabled": true,
  "tamper_detection_strict": true
}`,
    size: 236,
    permissions: '0640',
    owner: 'www-data:www-data',
    lastModified: '2026-10-09 11:05:44 UTC'
  },
  {
    id: 'f-5',
    path: '/etc/hosts',
    name: 'hosts',
    category: 'system',
    content: `127.0.0.1   localhost
127.0.1.1   aegis-secops-node1
10.0.4.50   internal-siem.corp.local
10.0.4.55   vault-kms.corp.local
# Blocked malicious C2 domains
0.0.0.0     evil-c2-tracker.xyz
0.0.0.0     ransom-beacon.cc`,
    size: 198,
    permissions: '0644',
    owner: 'root:root',
    lastModified: '2026-10-08 16:30:19 UTC'
  },
  {
    id: 'f-6',
    path: '/usr/local/bin/vault-sync',
    name: 'vault-sync',
    category: 'binary',
    content: `#!/bin/bash
# Critical binary for cryptographic secret synchronization
set -euo pipefail
VAULT_ADDR="https://vault-kms.corp.local:8200"
test -f /etc/aegis/token || exit 1
exec /usr/bin/curl -sf --tlsv1.3 "$VAULT_ADDR/v1/sys/health" > /dev/null`,
    size: 215,
    permissions: '0755',
    owner: 'root:root',
    lastModified: '2026-10-06 08:00:00 UTC'
  }
];

export const AWARENESS_MODULES: AwarenessModule[] = [
  {
    id: 'mod_1',
    title: 'Cryptographic Foundations & Hash Avalanching',
    standard: 'NIST SP 800-107 / FIPS 180-4',
    badge: 'Cryptography Core',
    overview: 'File Integrity Monitoring relies on one-way cryptographic hash algorithms (such as SHA-256 and SHA-512) that map arbitrary input data to a fixed-length hexadecimal digest. These functions guarantee pre-image resistance and collision resistance.',
    keyPoints: [
      'Strict Pre-image Resistance: Computationally infeasible to reverse hash H to recover original input M.',
      'Avalanche Effect: Changing a single character or byte in a file causes more than 50% of the hash output bits to flip completely.',
      'Deterministic Output: The identical file always yields the exact same cryptographic fingerprint.',
      'Collision Resistance: Infeasible for an attacker to generate two distinct files with matching digests.'
    ],
    threatScenario: {
      title: 'SolarWinds SUNBURST Supply-Chain Injection',
      description: 'Attackers compromised the software build pipeline and altered source files prior to compilation. Standard antivirus missed the malicious source modification, but strict pre-build and post-build cryptographic hashing against baseline would have flagged the discrepancy immediately.',
      detectionMethod: 'Cryptographic baseline hash mismatch triggered on modified DLL assembly before code-signing.',
      impact: 'Prevented deployment of compromised updates across 18,000 downstream customer environments.'
    }
  },
  {
    id: 'mod_2',
    title: 'Compliance Mandates & Industry Standards',
    standard: 'PCI-DSS 11.5 / HIPAA §164.312 / CIS 10.5',
    badge: 'Regulatory Mandate',
    overview: 'Regulatory frameworks explicitly require automated file integrity checking to verify that system binaries, security configurations, and audit records remain pristine without unauthorized modification.',
    keyPoints: [
      'PCI-DSS Requirement 11.5: Mandates deployment of a file integrity monitoring tool to alert personnel to unauthorized modification of critical system files, configuration files, or content files.',
      'HIPAA Security Rule §164.312(c)(1): Requires electronic protected health information (ePHI) mechanisms to corroborate that data has not been altered or destroyed in an unauthorized manner.',
      'CIS Critical Security Controls v8 (Control 10.5): Requires organizations to monitor and verify critical file baselines and detect unauthorized changes to binaries and system configurations.',
      'NIST SP 800-53 (Control SI-7 Software, Firmware, and Information Integrity): Requires integrity verification tools on startup and periodically.'
    ],
    threatScenario: {
      title: 'Payment Gateway Webshell Web-Skimming Attack',
      description: 'An attacker gains access through an unpatched CMS vulnerability and appends JavaScript skimmer code to an e-commerce checkout page script.',
      detectionMethod: 'FIM agent compares hash of checkout scripts against approved release baseline snapshot within 10 seconds.',
      impact: 'Immediate alert fired to SOC, automated rollback triggered, preventing credit card data exfiltration.'
    }
  },
  {
    id: 'mod_3',
    title: 'Authentication, Least Privilege & Access Control (RBAC)',
    standard: 'NIST SP 800-63B / OWASP Top 10 A01:2021',
    badge: 'Access Governance',
    overview: 'A file integrity system must defend itself against unauthorized tampering. Administrative actions such as establishing a baseline snapshot or accepting file modifications require strict multi-role authentication and cryptographic session tokens.',
    keyPoints: [
      'Principle of Least Privilege: Auditors and Interns have read-only visibility, while only verified Administrators can commit new baseline snapshots.',
      'Tamper-Resistant Storage: Baseline signatures must be sealed using out-of-band cryptographic HMAC keys or write-once-read-many (WORM) storage.',
      'Session Security: Tokens must be time-bound with strict revocation mechanisms and multi-factor authentication (MFA).',
      'Dual Authorization: High-consequence operations (e.g. baseline re-keying) should mandate secondary analyst approval.'
    ],
    threatScenario: {
      title: 'Rogue Administrator / Compromised Analyst Credentials',
      description: 'An attacker compromises a low-privilege auditor account and attempts to overwrite the baseline hash of /etc/shadow to disguise a root password modification.',
      detectionMethod: 'RBAC policy firewall intercepts the baseline commit attempt, logs unauthorized privilege escalation event, and denies the modification.',
      impact: 'Rogue action neutralized before baseline integrity could be poisoned.'
    }
  },
  {
    id: 'mod_4',
    title: 'Input Validation & Defensive Engineering',
    standard: 'OWASP Top 10 A03:2021 / CWE-22 / CWE-626',
    badge: 'Application Security',
    overview: 'File integrity monitors consume external inputs (file paths, hash strings, binary files). Without stringent validation, attackers can exploit path traversal, null-byte injections, and extension spoofing to blind or compromise the monitoring engine.',
    keyPoints: [
      'Path Traversal Prevention: Reject paths containing `../`, backslashes, or URL-encoded variations (`%2e%2e`).',
      'File Header (Magic Byte) Inspection: Never trust user-supplied file extensions; verify actual binary headers (e.g. `%PDF`, `MZ`, `89 50 4E 47`).',
      'Hex Format Whitelisting: Validate incoming hash digests with strict regex: exact length and [0-9a-f] character set.',
      'Null-Byte Neutralization: Strip or abort on any `\\0` byte sequence designed to truncate file paths in system libraries.'
    ],
    threatScenario: {
      title: 'Malware Disguised via Extension Spoofing',
      description: 'Malware executable `payload.exe` renamed to `invoice_receipt.pdf` and uploaded to a document repository. Simple extension checks classify it as a safe PDF document.',
      detectionMethod: 'FIM magic-byte validation engine inspects first 4 bytes, detects DOS executable header (4D 5A / MZ), and flags critical masquerading threat.',
      impact: 'Payload quarantined before execution in sandbox environment.'
    }
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why does changing a single byte in a file cause an entirely different SHA-256 hash output?',
    options: [
      'Because of the cryptographic Avalanche Effect designed into the hashing algorithm',
      'Because SHA-256 compresses files based on character positions',
      'Because the file modification timestamp is included in the hash automatically',
      'Because the browser cache invalidates old hash values'
    ],
    correctAnswer: 0,
    explanation: 'The Avalanche Effect is a fundamental cryptographic property where a minor modification (even 1 bit) creates an uncorrelated, drastically altered output (flipping ~50% of hash bits).',
    concept: 'Cryptographic Avalanche Effect'
  },
  {
    id: 2,
    question: 'Which compliance standard explicitly mandates File Integrity Monitoring (FIM) for detecting changes to critical system files?',
    options: [
      'PCI-DSS Requirement 11.5',
      'ISO 9001 Clause 4',
      'CAN-SPAM Act 2003',
      'IEEE 802.11 Protocol'
    ],
    correctAnswer: 0,
    explanation: 'PCI-DSS Requirement 11.5 specifically mandates the deployment of a file integrity monitoring tool to alert personnel to unauthorized modifications of critical system and configuration files.',
    concept: 'PCI-DSS Compliance'
  },
  {
    id: 3,
    question: 'What is the danger of relying purely on a file extension (like .pdf or .png) to determine file safety?',
    options: [
      'Extensions can be freely renamed by adversaries to disguise executable malware (e.g., EXE with MZ header masquerading as PDF)',
      'Extensions consume too much CPU memory to parse',
      'File extensions are only supported on Windows operating systems',
      'File extensions change the cryptographic hash of the content'
    ],
    correctAnswer: 0,
    explanation: 'Adversaries commonly rename malicious executables (PE/ELF binaries) with benign extensions. Robust security requires inspecting magic bytes (binary signatures) at the start of the file.',
    concept: 'Magic Byte Verification & Anti-Masquerading'
  },
  {
    id: 4,
    question: 'In an attack payload containing "../../etc/shadow", what vulnerability is the attacker attempting to exploit?',
    options: [
      'Path Traversal (CWE-22) to navigate outside the intended working directory',
      'Cross-Site Request Forgery (CSRF)',
      'SQL Injection against the database',
      'Distributed Denial of Service (DDoS)'
    ],
    correctAnswer: 0,
    explanation: 'Path traversal attacks use dot-dot-slash (../) sequences to escape restricted directories and access sensitive operating system files.',
    concept: 'Directory Traversal Prevention'
  },
  {
    id: 5,
    question: 'Why is MD5 no longer recommended for high-security cryptographic integrity checks in enterprise SOC environments?',
    options: [
      'MD5 has known cryptographic collision vulnerabilities where different files can produce identical hashes',
      'MD5 takes too long to compute compared to SHA-512',
      'MD5 hashes cannot be stored in JSON files',
      'MD5 is an asymmetric encryption key rather than a hash function'
    ],
    correctAnswer: 0,
    explanation: 'Researchers demonstrated practical collision attacks against MD5 (Wang et al., Flame malware). Modern systems require SHA-256 or SHA-512 for collision-resistant integrity baselines.',
    concept: 'Collision Resistance & Hash Security'
  },
  {
    id: 6,
    question: 'Under the Principle of Least Privilege in a FIM architecture, what should an "Auditor" role be permitted to do?',
    options: [
      'View baseline snapshots, verify test results, and export audit dossiers in read-only mode',
      'Delete security audit logs and disable tamper alerts',
      'Inject backdoor scripts and re-key master cryptographic seals',
      'Modify system binaries without logging'
    ],
    correctAnswer: 0,
    explanation: 'The Principle of Least Privilege requires giving users only the minimum access necessary for their tasks. Auditors require read-only verification rights, without authority to alter baselines or suppress alerts.',
    concept: 'Principle of Least Privilege (RBAC)'
  },
  {
    id: 7,
    question: 'What does a "PERMISSIONS_CHANGED" alert signify in a file integrity monitoring scan?',
    options: [
      'The file metadata or access control list (e.g., chmod 0600 to 0777) changed, creating privilege escalation risk',
      'The file was renamed to uppercase letters',
      'The computer clock was adjusted for daylight savings time',
      'The hard drive has run out of physical disk space'
    ],
    correctAnswer: 0,
    explanation: 'Permissions drift (such as a private /etc/shadow or configuration file being made world-writable) is a common symptom of privilege escalation or misconfiguration.',
    concept: 'Permissions Drift & Metadata Integrity'
  },
  {
    id: 8,
    question: 'How does an audit log hash chain prevent attackers from secretly deleting or modifying historical log entries?',
    options: [
      'Each log entry includes the cryptographic hash of the previous entry, so altering any past log breaks the chain verification',
      'It encrypts the entire operating system drive',
      'It sends an SMS to all employees whenever a log is generated',
      'It prevents files from ever being closed by the kernel'
    ],
    correctAnswer: 0,
    explanation: 'Hash chaining binds each record to the previous one (similar to a blockchain or Merkle tree). Any modification, deletion, or re-ordering immediately invalidates downstream hashes.',
    concept: 'Tamper-Evident Audit Chains'
  }
];
