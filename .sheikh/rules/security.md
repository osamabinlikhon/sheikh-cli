# Security Rules

## General Principles

- Never trust user input
- Principle of least privilege
- Defense in depth
- Fail securely
- Keep security simple

## Secrets Management

### Hardcoded Secrets
**NEVER** commit secrets to git:
- API keys
- Passwords
- Private keys
- Database credentials
- JWT secrets

### Environment Variables
- Use .env files (gitignored)
- Validate required variables on startup
- Never log secrets
- Rotate secrets regularly

## Input Validation

### User Input
- Validate at the boundary
- Use whitelisting over blacklisting
- Check type, length, format
- Sanitize before use

### File Uploads
- Validate file types
- Check file size limits
- Scan for malware
- Store outside web root
- Use random filenames

## Authentication & Authorization

### Authentication
- Use established libraries (Passport, Auth0, etc.)
- Implement MFA where possible
- Use secure session management
- Set appropriate session timeouts

### Authorization
- Check permissions on every request
- Use role-based access control (RBAC)
- Validate resource ownership
- Never rely on client-side checks

## SQL Injection Prevention

- **Always** use parameterized queries
- Never concatenate user input into SQL

## XSS Prevention

### Output Encoding
- Escape output in HTML contexts
- Use framework auto-escaping (React, Vue)
- Be careful with dangerouslySetInnerHTML

### Content Security Policy
- Use CSP headers to prevent XSS
- default-src 'self'
- script-src 'self'

## Dependencies

### Vulnerability Scanning
- Run npm audit regularly
- Use Dependabot or similar
- Pin dependency versions
- Review new dependencies

### Supply Chain Security
- Verify package signatures
- Use lock files (package-lock.json)
- Avoid abandoned packages
- Check package download counts and maintainers

## Logging & Monitoring

### Security Events
Log these events:
- Failed login attempts
- Permission violations
- Data access (sensitive)
- Configuration changes
- Error conditions

### What NOT to Log
- Passwords
- API keys
- Credit card numbers
- Personal identifiable information (PII)
- Session tokens

## HTTPS & TLS

- Use HTTPS everywhere
- Enable HSTS
- Use secure cookies
- Keep TLS certificates updated
- Disable weak cipher suites

## Security Checklist

Before committing code:
- [ ] No hardcoded secrets
- [ ] Input validation in place
- [ ] Output properly encoded
- [ ] Authentication checks added
- [ ] Authorization verified
- [ ] SQL queries parameterized
- [ ] File uploads validated
- [ ] Dependencies scanned
- [ ] Security headers set

## Incident Response

If security issue found:
1. Assess severity
2. Create private fix
3. Test thoroughly
4. Deploy quickly
5. Document lessons learned
