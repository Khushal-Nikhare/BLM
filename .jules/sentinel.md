## 2026-05-05 - Insecure JWT Secret Fallback due to ES Module Load Order
**Vulnerability:** The application was silently falling back to a hardcoded, insecure JWT secret (`'default_secret'`) in production because `process.env.JWT_SECRET` evaluated to `undefined` when the `auth.js` files were imported.
**Learning:** In Node.js applications using ES Modules (`import`/`export`), imported modules are evaluated *before* the code in the entry point executes. Because `dotenv.config()` was called in `index.js`, the environment variables were not yet loaded into `process.env` when `middleware/auth.js` and `routes/auth.js` evaluated their top-level constants (`const SECRET = process.env.JWT_SECRET || 'default_secret';`). This bypassed the intended configuration and forced the application to use the fallback string.
**Prevention:**
1. Do not use insecure fallbacks (e.g., `'default_secret'`) for critical cryptographic keys in production code. Fail fast securely instead.
2. When relying on `dotenv` in an ES Module environment, evaluate environment variables dynamically at runtime (inside the function/route handler) rather than statically at the module level.
