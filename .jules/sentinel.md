## 2024-05-07 - Insecure JWT Secret Fallback due to ES Module Load Order
**Vulnerability:** JWT authentication was falling back to a hardcoded `default_secret`.
**Learning:** In Node.js with ES Modules, `import` statements are evaluated before the remaining code. Because `dotenv.config()` is called in `index.js` after imports, modules like `auth.js` that check `process.env.JWT_SECRET` at the top level evaluate it as `undefined` and use the fallback, even if `.env` has the secret.
**Prevention:** Always evaluate environment variables dynamically inside functions when they depend on `dotenv` initialization in the main entry point, and never use insecure fallback secrets for critical cryptographic operations.

## 2024-05-07 - IDOR in Lead Updates and Bulk Import
**Vulnerability:** The `/api/leads/:id` PATCH and `/api/leads/bulk` POST endpoints lacked ownership verification, allowing any authenticated user to modify other users' leads by guessing the lead ID or importing a lead with an existing `googlePlaceId`.
**Learning:** When performing updates on resources, it is not sufficient to simply be authenticated. The server must explicitly verify that the authenticated user owns the resource being modified or has administrative privileges. Bulk operations are especially susceptible to IDOR if they implement "upsert" logic without ownership checks.
**Prevention:** Always implement an authorization check (e.g., `resource.userId === user.id || user.role === 'ADMIN'`) before performing any state-changing operations (UPDATE, DELETE) on a resource.
