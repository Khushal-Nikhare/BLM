## 2024-05-04 - [CRITICAL] Fix Hardcoded JWT Secret Fallback

**Vulnerability:** The backend had a hardcoded default JWT secret (`const SECRET = process.env.JWT_SECRET || 'default_secret';`) defined at the module scope in `middleware/auth.js` and `routes/auth.js`.
**Learning:** Due to how Node.js ES modules are evaluated, variables initialized at the module level are evaluated when the file is first imported. Because `dotenv.config()` was called in `index.js` *after* importing the routes and middleware, `process.env.JWT_SECRET` was always undefined at import time, forcing the application to use the insecure `'default_secret'` regardless of the `.env` file configuration.
**Prevention:**
1. Always load configuration/environment variables (e.g., `dotenv.config()`) as the absolute first step in the application entry point, or use the `--env-file` Node.js flag.
2. Read critical secrets dynamically within the function/route scope where they are used, rather than caching them at module load time, to ensure they have the latest value.
3. Never use insecure fallback values for critical cryptographic secrets. If a secret is missing, the application should log a critical error and fail securely (e.g., return a 500 status) instead of silently succeeding with a weak key.
