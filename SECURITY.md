# Security Policy

## Supported Versions

The following versions of **Web Marker** are currently supported with security and stability updates.

| Version | Supported |
| -------- | --------- |
| 1.0.x (latest release) | ✅ |
| < 1.0.0 | ❌ |

---

## Reporting a Vulnerability

If you discover a security vulnerability, privacy leak, or behavior that could negatively impact users or the host browser environment, please report it responsibly.

### Before Reporting

Please ensure that:

- The issue is reproducible.
- You are using the latest supported release of **Web Marker** (v1.0.0+).
- The issue is not caused by modified builds, unsupported browser forks, or conflicting third-party extensions.

### How to Report

You can report vulnerabilities through:

- **GitHub Issues:** [hamzabellouch/web-marker-ex/issues](https://github.com/hamzabellouch/web-marker-ex/issues) (for general non-sensitive bugs or security queries)
- **Email Contact:** `hamzabellouchcontact@gmail.com` (for sensitive vulnerabilities, security disclosures, or exploit details)

When submitting a report, please include:

- Browser name and version (e.g., Chrome 130+, Firefox 132+, Edge 130+)
- Operating system and version (e.g., Windows 11, macOS Sequoia, Ubuntu 24.04)
- **Web Marker** version (e.g., v1.0.0)
- Steps to reproduce the vulnerability
- Target webpage URL where the issue occurred (if applicable)
- Console error logs or debug screenshots (if available)
- A clear assessment of the potential security or privacy impact

### Response Policy

Security reports are reviewed as quickly as possible.

If a report is confirmed:

- The vulnerability will be investigated and patched promptly.
- A fix will be included in the next update release.
- Credit will be given to the reporter upon request.

If a report cannot be reproduced, lacks actionable information, or is determined not to be a security issue, it will be closed with a clear explanation.

---

## Security & Architecture Notes

**Web Marker** executes entirely within your browser and is architected under strict security principles:

- **Strict Local Client-Side Execution:** All extension logic runs locally using Manifest V3 service workers (Chromium) and background scripts (Firefox). Remote code execution (`eval`, dynamic remote script tags, or external CDN script loading) is strictly forbidden under our Content Security Policy.
- **Sandboxed DOM Isolation & Sanitization:** Highlighting manipulates text node ranges cleanly by wrapping them with scoped `<span>` elements using isolated CSS classes. Arbitrary HTML or unverified user strings are never injected into the page DOM as executable markup, mitigating DOM-based cross-site scripting (XSS) risks.
- **Safe Local Storage Isolation:** Highlight data is persisted strictly via `chrome.storage.local`, segmented by URL origin, and stored within the extension's private sandboxed storage. Webpages visited cannot read, modify, or tamper with your stored highlights.
- **Minimal Privilege Scope:** Web Marker requests only the minimal permissions required to function (`storage` and `activeTab`), avoiding intrusive privileges such as cookies, webRequest, or clipboard interception.
- **Zero Background Telemetry:** The extension contains zero tracking SDKs, analytics beacons, telemetry collectors, or background telemetry calls.

Users are encouraged to:

- Keep **Web Marker** updated to the latest release.
- Install the extension only from the official repository ([hamzabellouch/web-marker-ex](https://github.com/hamzabellouch/web-marker-ex)) or verified store listings.
- Avoid installing modified, repackaged, or unofficial third-party builds.
- Report any unexpected behavior that could affect security or browsing stability.

Security, user privacy, and dependable local execution are foundational priorities for this project.
