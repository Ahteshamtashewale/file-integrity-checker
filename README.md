# AegisFIM — File Integrity Checker & Security Monitoring Platform

![Cybersecurity](https://img.shields.io/badge/Security-File%20Integrity%20Monitoring-06b6d4?style=flat-square)
![Tests](https://img.shields.io/badge/Test%20Suite-12%2F12%20Passed-10b981?style=flat-square)
![Standards](https://img.shields.io/badge/Compliance-PCI--DSS%20%7C%20HIPAA%20%7C%20NIST-6366f1?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![License](https://img.shields.io/badge/License-Apache--2.0-slate?style=flat-square)

> A practical cybersecurity virtual internship project implementing **File Integrity Monitoring (FIM)** using industry defense-in-depth principles: cryptographic baseline hashing, real-time tamper detection, strict input validation, role-based access control (RBAC), tamper-evident SIEM logging, and an automated verification test suite.

---

## 📌 Project Summary

- **Repository Name:** `file-integrity-checker`
- **Description:** Practical Cybersecurity Virtual Internship Project: File Integrity Monitoring (FIM) with Web Crypto API, Baseline Hashing, Tamper Detection, Input Validation, and SIEM Audit Logs.
- **Candidate Identifier:** CYBER-INT-2026-8841

---

## 🛡️ Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Personas:**
  - `Administrator`: Full authority to establish golden baselines, manage security policies, and inject simulated tampers.
  - `Security Analyst`: Operational monitoring, running live integrity scans, and inspecting cryptographic diffs.
  - `Auditor / Intern`: Read-only verification, automated test suite execution, and exporting official project dossiers.
- **Multi-Factor Authentication (MFA):** Simulated RFC 6238 time-synchronized TOTP authenticator verification.
- **Zero-Trust Session Tokens:** Cryptographically simulated RS256 Bearer JWTs with least-privilege policy enforcement.
- **AAA Security Framework:** Grounded in Authentication, Authorization, and Accounting.

### 2. Input Validation Firewall
- **Directory Traversal Defense (CWE-22):** Intercepts and neutralizes relative traversal sequences (`../`, `..\\`) and encoded patterns (`%2e%2e%2f`).
- **Null-Byte Injection Neutralization (CWE-626):** Strips `\0` and `%00` termination bypass sequences used to defeat file extension filters.
- **Magic-Byte Binary Inspection:** Analyzes binary header signatures (`4D 5A` DOS MZ executable, `%PDF-1.x`, `89 50 4E 47` PNG, `7F 45 4C 46` ELF) to catch trojan files disguised with benign extensions.
- **Strict Hash Format Checking:** Enforces strict length and hexadecimal regex (`[0-9a-f]`) for SHA-256 (64 hex), SHA-512 (128 hex), SHA-1 (40 hex), and MD5 (32 hex).

### 3. Cryptographic Security Checks (FIM Engine)
- **Web Crypto API:** Client-side hardware-accelerated cryptographic hashing supporting SHA-256, SHA-512, and SHA-1, alongside a legacy pure-JS MD5 engine for collision comparisons.
- **Golden Baseline Vault:** Snapshots critical system assets (`nginx.conf`, `/etc/shadow`, `sshd_config`, `config.json`, `/etc/hosts`, `vault-sync`) and seals them with an aggregate digital SHA-256 signature.
- **Cryptographic Avalanche Analysis:** Character-by-character diff and bit-level divergence tracking (>50% of output bits flipped on single-byte changes).
- **Adversary Tampering Simulator:** Interactive simulation of single-bit flips, webshell backdoor insertions, permissions drift (`chmod 0777`), and file deletion.
- **Real File Drag-and-Drop:** Drag and drop local files to compute genuine SHA-256 digests in real time.
- **Automated Watchdog Auto-Scan:** Configurable periodic polling engine with heartbeat indicators.

### 4. Tamper-Resistant Logging & SIEM Export
- **Cryptographic Hash Chain:** Every audit event includes a SHA-256 seal bound to the preceding entry (`prevHash`), preventing undetectable history manipulation.
- **Live Chain Integrity Verifier:** Interactive validation engine checking cryptographic continuity across all event records.
- **Multi-Format SIEM Streams:** Instant export and downloads in:
  - Structured Table View
  - RFC 5424 Syslog
  - ArcSight / Splunk Common Event Format (CEF)
  - JSON-ND Stream
- **Severity Categorization:** `INFO`, `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.

### 5. Cybersecurity Awareness & Education
- **Regulatory Compliance Guide:** Detailed operational mappings to:
  - **PCI-DSS v4.0 Requirement 11.5**
  - **HIPAA Security Rule §164.312(c)(1)**
  - **CIS Critical Security Controls v8 (10.5)**
  - **NIST SP 800-53 Control SI-7**
- **Interactive Avalanche Effect Demonstrator:** Real-time side-by-side text modification playground with bit-level divergence meters.
- **Threat Case Studies:** Analysis of the SolarWinds SUNBURST supply-chain trojan, e-commerce web-skimmers, and ransomware mitigation.
- **Interactive Assessment Quiz:** 8 scenario-based technical questions with scoring, instant feedback, and verified qualification badges.

### 6. Automated Testing & Project Submission Dossier
- **12 Automated Security Test Cases:** Comprehensive test runner covering NIST KAT vectors, avalanche thresholds, path traversal sanitization, magic-byte checks, and RBAC policies.
- **Official 4-Page PDF Export:** Built-in vector PDF generator with candidate metadata, documented workflow, test execution proof, and digital signature block.

---

## 🏛️ Documented Workflow Architecture

```
┌─────────────────────────────────┐
│  01. Asset Ingestion & Input    │ -> Canonical sandbox resolution, null-byte stripping,
│      Validation Firewall        │    magic-byte binary header verification
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  02. Golden Baseline Snapshot   │ -> Web Crypto SHA-256 hashing, aggregate catalog seal,
│      Vault                      │    immutable baseline timestamping
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  03. Scheduled & Real-Time      │ -> Continuous watchdog probing, real-time hash calculation,
│      Watchdog Engine            │    metadata drift inspection (permissions/size)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  04. Differential Drift         │ -> State categorization: NOMINAL, MODIFIED,
│      Analyzer                   │    PERM_DRIFT, ADDED (rogue), DELETED (missing)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  05. Tamper-Proof SIEM          │ -> Chained SHA-256 seals, RFC 5424 Syslog, ArcSight CEF,
│      Audit Stream               │    and candidate submission dossier
└─────────────────────────────────┘
```

---

## 🧪 Automated Test Suite (12 / 12 Verified)

| Test ID | Category | Test Case Name | Result | Diagnostic Output |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Cryptography | NIST SHA-256 Known-Answer Vector Verification | `PASSED` | Exact match with FIPS 180-4 standard vectors |
| **TC-02** | Cryptography | Cryptographic Avalanche Effect (>40% Bit Flip) | `PASSED` | 53.1% output bits flipped on 1-byte delta |
| **TC-03** | Input Validation | Directory Traversal (CWE-22) Defense & Neutralization | `PASSED` | `../../../../etc/shadow` quarantined and sanitized |
| **TC-04** | Input Validation | Null-Byte Injection (CWE-626) Sanitization | `PASSED` | `\0` stripped, extension truncation blocked |
| **TC-05** | Input Validation | Magic Byte Masquerading Detection (PE vs PDF) | `PASSED` | DOS MZ header flagged in `invoice.pdf` |
| **TC-06** | Input Validation | Hash Hexadecimal Strict Regex `[0-9a-f]{64}` | `PASSED` | SQL injection and invalid lengths rejected |
| **TC-07** | Integrity Detection | Golden Baseline Snapshot Seal Immutability | `PASSED` | Deterministic SHA-256 aggregate catalog seal |
| **TC-08** | Integrity Detection | Unauthorized Content Tampering & Webshell Flagging | `PASSED` | Immediate `MODIFIED` state and high-severity alert |
| **TC-09** | Integrity Detection | Rogue Asset Detection (Unauthorized File Creation) | `PASSED` | Unapproved file addition flagged as `ADDED` |
| **TC-10** | Integrity Detection | Critical System Binary Deletion Detection | `PASSED` | Missing enrolled asset flagged as `CRITICAL DELETED` |
| **TC-11** | Access Control | RBAC Policy Guard & Least-Privilege Enforcement | `PASSED` | Auditor blocked from overwriting golden baseline |
| **TC-12** | Audit Compliance | Audit Log Cryptographic Hash-Chain Verification | `PASSED` | All log entries verified against SHA-256 seals |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/file-integrity-checker.git

# Enter project directory
cd file-integrity-checker

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📜 License & Attestation

Developed as a virtual cybersecurity internship project. Distributed under the Apache-2.0 License.
