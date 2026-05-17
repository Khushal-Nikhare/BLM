
## 2024-05-17 - [Protecting Third-Party API Proxies]
**Vulnerability:** The backend Google Places API proxy endpoints (`/api/search` and `/api/place-details/:id`) were completely public, exposing the backend's `GOOGLE_PLACES_API_KEY` to abuse without requiring authentication.
**Learning:** Third-party API proxies in the backend must always be protected with at least the same level of authentication as the core application routes. If an API key is required on the backend, the endpoint using it must be secured, otherwise the key acts as an open proxy for the internet, leading to potential quota exhaustion and billing abuse.
**Prevention:** Always add authentication middleware (e.g., `verifyToken`) to routes that proxy requests to paid or quota-limited external services.
