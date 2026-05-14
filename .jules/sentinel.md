# Sentinel's Journal

## 2024-05-14 - Fix IDOR in Lead Update Endpoint
**Vulnerability:** Insecure Direct Object Reference (IDOR) on `PATCH /api/leads/:id` where any authenticated user could modify leads belonging to other users.
**Learning:** The application had an authentication check (`verifyToken`), but it lacked the crucial authorization check to ensure the resource being modified belonged to the user making the request. Merely being authenticated is not enough to allow modification of specific resources.
**Prevention:** Always verify resource ownership (e.g., `lead.userId === req.user.id`) or appropriate administrative privileges before executing update or delete operations on specific records.
