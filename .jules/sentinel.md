## 2024-05-18 - Missing Authentication on Proxy Endpoints
**Vulnerability:** The proxy endpoints `/api/search` and `/api/place-details/:id` used to query the Google Places API lacked the `verifyToken` middleware, making them accessible to unauthenticated users. This could allow malicious actors to abuse the application's API keys and incur unauthorized charges.
**Learning:** External API integrations should always be evaluated for potential misuse and unauthorized access, even if they aren't directly exposing sensitive internal data. If a route costs money or exposes an external integration, it must be protected.
**Prevention:** Consistently apply authentication middleware (like `verifyToken`) to all API routes unless there is an explicit and documented requirement for them to be public.
