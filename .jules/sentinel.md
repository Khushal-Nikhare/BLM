## 2026-04-30 - Insecure JWT Secret Fallback
**Vulnerability:** The application used a hardcoded string ('default_secret') as a fallback for the JWT_SECRET environment variable. This would allow an attacker to forge valid authentication tokens if the environment variable was not configured properly.
**Learning:** This codebase incorrectly relied on a fallback value for a cryptographic key. Environment variables required for security must never use predictable or hardcoded fallback values.
**Prevention:** When accessing security-critical environment variables (like secrets, salts, or encryption keys), the application should explicitly check for their presence and fail to start (fail securely) if they are missing. Do not provide default values for these variables in code.
