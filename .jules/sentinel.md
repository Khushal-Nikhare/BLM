## 2024-03-24 - Protect External API Proxy Routes

**Vulnerability:** The backend endpoints `/api/search` and `/api/place-details/:id` that proxied requests to the Google Places API were completely unauthenticated.
**Learning:** Any endpoint that proxies requests to a paid external service (like Google APIs) must be protected by authentication to prevent unauthorized usage, cost overruns, and API quota abuse. Even if the frontend requires a login, the backend proxy endpoint itself can be accessed directly if not secured.
**Prevention:** Always apply the `verifyToken` (or equivalent) authentication middleware to all API proxy endpoints during their initial creation.
