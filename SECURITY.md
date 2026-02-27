# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Spotify Radio, please report it responsibly.

**Do NOT open a public issue.** Instead:

1. Email your findings to the project maintainer (see GitHub profile for contact info)
2. Include a detailed description of the vulnerability
3. Include steps to reproduce the issue
4. If possible, suggest a fix

### What to expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix timeline** depends on severity (critical issues are prioritized)

### Scope

The following are in scope:
- Authentication/authorization bypass
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- SQL injection
- Server-side request forgery (SSRF)
- Sensitive data exposure
- Rate limiting bypass

The following are out of scope:
- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report these upstream)
- Issues requiring physical access to a user's device

## Security Best Practices

When contributing, please ensure:
- No secrets or API keys in code or commits
- Input validation on all user-provided data
- Parameterized queries (handled by Prisma ORM)
- Proper error handling that doesn't leak internal details
- HTTPS-only in production
