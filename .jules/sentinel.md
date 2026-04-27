## 2024-05-18 - [CRITICAL] Fixed Hardcoded JWT Secret Fallback and Unauthenticated Proxy Routes
**Vulnerability:** The application was using a hardcoded fallback (`'default_secret'`) for `JWT_SECRET` in `auth.js` files, and proxy routes (`/api/search` and `/api/place-details/:id`) were unauthenticated.
**Learning:** Hardcoded fallback secrets are extremely dangerous and can allow attackers to forge tokens if the environment variable is not set correctly. Unauthenticated proxy endpoints can be abused.
**Prevention:** Implement a fail-fast mechanism that explicitly checks for required secrets (like `JWT_SECRET`) and crashes the app immediately if missing. Ensure all API proxy endpoints apply appropriate authentication middleware.
