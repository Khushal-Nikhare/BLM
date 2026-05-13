## 2024-05-13 - [CRITICAL] Fix hardcoded JWT secret fallback

**Vulnerability:** The Node.js Express backend had a critical vulnerability where `JWT_SECRET` used an insecure fallback (`'default_secret'`) at the module level in `backend/routes/auth.js` and `backend/middleware/auth.js`. This allowed attackers to potentially forge valid JWTs if the environment variable was missing or incorrectly loaded.

**Learning:** In ES Modules, module imports and top-level code are evaluated *before* `dotenv.config()` is executed in `index.js`. Thus, any environment variables from `dotenv` accessed at the top level of exported modules will be `undefined`, causing the insecure fallback to be used instead of the intended secret.

**Prevention:** Always evaluate environment variables dynamically within functions (e.g. routes or middleware) rather than at the top level of exported ES modules. When handling missing critical environment variables (like secrets), the backend must fail securely by logging a critical error and returning a 500 Internal Server Error, rather than using insecure fallbacks.
