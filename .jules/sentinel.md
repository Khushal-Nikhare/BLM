## 2024-05-25 - [CRITICAL] Fix hardcoded JWT secret fallback and dynamic eval

**Vulnerability:** The application was using an insecure hardcoded fallback for the `JWT_SECRET` (`'default_secret'`) in `backend/middleware/auth.js` and `backend/routes/auth.js`. This could lead to a compromise of all authentication tokens if the environment variable was missing or misconfigured in production.

**Learning:** Due to how ES modules evaluate imports before executing code like `dotenv.config()` in the main entry file (`index.js`), any variables derived from `process.env` at the top level of an imported module will be undefined (or fallback to defaults) during module initialization. Critical secrets must be evaluated dynamically inside the functions that use them to ensure the environment has been fully initialized.

**Prevention:** Never use hardcoded fallback values for secrets like JWT signing keys or API credentials. Fail securely (e.g., return a 500 error and log a critical alert) if required environment variables are absent. When using ES modules and `dotenv`, evaluate secrets dynamically at runtime rather than at the top level of the module, or ensure `dotenv/config` is imported before any other modules in the application entry point.
