## 2024-05-22 - [Missing Authentication on Proxy Endpoints]
**Vulnerability:** The Google Places proxy endpoints (`/api/search` and `/api/place-details/:id`) lacked authentication (e.g. `verifyToken` middleware).
**Learning:** Proxy endpoints that consume paid 3rd-party APIs (like Google Places) are susceptible to unauthorized access and quota abuse if left exposed without authentication, even if other business-logic endpoints are secured.
**Prevention:** Always apply authentication middleware to all API endpoints, including proxy endpoints, unless there is an explicit requirement for them to be public.
