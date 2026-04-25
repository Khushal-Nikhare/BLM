## 2024-04-25 - [Missing Authentication on API Proxy Endpoints]
**Vulnerability:** The Google Places API proxy endpoints (`/api/search` and `/api/place-details/:id`) were exposed without any authentication checks, allowing unauthenticated users to consume the server's paid API quota.
**Learning:** API proxy endpoints intended for authenticated clients must inherit those authentication requirements. Relying on the frontend UI to hide the endpoints is insufficient security.
**Prevention:** Always secure backend proxy routes that call external third-party APIs with the same level of authentication (e.g., `verifyToken`) required by the primary application endpoints.
