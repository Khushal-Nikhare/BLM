## 2024-05-16 - [Hardcoded Secret Fallback due to ES Module Load Order]
**Vulnerability:** The application was silently falling back to a hardcoded JWT_SECRET ('default_secret') because `process.env.JWT_SECRET` was undefined at the time of module evaluation.
**Learning:** In ES Modules (`import/export`), imports are hoisted and evaluated *before* the executing file (e.g., `index.js`). Since `dotenv.config()` was called inside `index.js`, any imported modules (`auth.js`, `middleware.js`) that defined top-level `const SECRET = process.env.JWT_SECRET || 'default_secret'` evaluated *before* the `.env` file was actually loaded, triggering the insecure default.
**Prevention:**
1. Never use fallback default strings for critical secrets (e.g., `|| 'default_secret'`). If a secret is missing, crash or return a 500 error securely.
2. Read environment variables dynamically inside functions/route handlers rather than at the top level of exported ES modules if `dotenv.config()` is loaded downstream.
