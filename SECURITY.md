# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.2.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0.0 | :x:                |

---

## Reporting a Vulnerability

The SomnoPulse AI development team takes security and medical data privacy seriously. If you discover a security vulnerability in this project:

1. **Do not create a public GitHub issue.**
2. Send an email to **backbenchersbinarysolution@gmail.com** with details of the vulnerability.
3. Include the following information:
   - Type of issue (e.g. buffer overflow, SQL/NoSQL injection, cross-site scripting, denial of service).
   - Step-by-step instructions or proof-of-concept payload to reproduce the issue.
   - Affected routes or components.
   - Any suggested mitigations.

We will acknowledge receipt of your vulnerability report within 48 hours and work with you to triage and release a patch before public disclosure.

---

## Security Architecture Highlights

- **HTTP Security Headers:** Powered by Helmet (Strict Content Security Policy, X-Content-Type-Options, Referrer-Policy).
- **Strict Payload Validation:** Schema enforcement powered by Zod with strict physiological boundaries (e.g., Pulse Pressure $\ge 15\text{ mmHg}$).
- **Rate Limiting:** Protects endpoints against denial-of-service and brute-force evaluation attacks.
- **Privacy First:** Assessments can be run 100% offline via the client-side Bayesian engine without transmitting patient identifiable health data over external networks.
