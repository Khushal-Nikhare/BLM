
## 2024-05-28 - [CRITICAL] Prevent Hardcoded Secrets Fallback in Node.js ES Modules
**Vulnerability:** The application was falling back to a hardcoded string ('default_secret') for JWT signing and verification (`const SECRET = process.env.JWT_SECRET || 'default_secret';`).
**Learning:** In ES Modules, top-level code (like `process.env.JWT_SECRET`) is evaluated immediately when the module is imported, which often happens *before* `dotenv.config()` is called in the main entry point (e.g., `index.js`). This results in `process.env.JWT_SECRET` being undefined at the time of evaluation, forcing the application to rely on the insecure hardcoded fallback, creating a massive authentication bypass vulnerability.
**Prevention:**
1. Never use hardcoded fallbacks for critical secrets.
2. Retrieve environment variables dynamically inside functions or route handlers (e.g., using a getter function) instead of at the top level of ES modules to ensure `dotenv.config()` has executed.
3. If a required secret is missing, fail securely by throwing an error and returning a 500 status code rather than proceeding with default credentials.
