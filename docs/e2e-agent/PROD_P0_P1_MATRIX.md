# Production P0/P1 Matrix

Populate this matrix with real business workflows.

| ID | Priority | Journey | URL/Module | Expected Outcome | Automation Status | Owner | Notes |
|---|---|---|---|---|---|---|---|
| AG-P0-001 | P0 | Login + role landing | /login -> role route | Successful auth and correct role route | Planned |  |  |
| AG-P0-002 | P0 | Core entity create | /app/core/new | Valid record saved with success signal | Planned |  |  |
| AG-P0-003 | P0 | Core list/detail visibility | /app/core/list, /app/core/{id} | Created record visible and correct detail | Planned |  |  |
| AG-P0-004 | P0 | Session protection | protected routes | Unauthenticated access redirected to login | Planned |  |  |
| AG-P0-005 | P0 | Logout enforcement | /logout + protected routes | Access blocked after logout | Planned |  |  |
| AG-P1-101 | P1 | Invalid login handling | /login | Error displayed, no session created | Planned |  |  |
| AG-P1-102 | P1 | Empty required field validation | /app/core/new | Validation error shown, no invalid save | Planned |  |  |
| AG-P1-103 | P1 | Role menu navigation | dashboard/sidebar | Correct pages accessible per role | Planned |  |  |
| AG-P1-104 | P1 | Refresh/reload state stability | protected pages | Session/page state remains consistent | Planned |  |  |
| AG-P1-105 | P1 | Negative route access | admin-only pages | Unauthorized role denied gracefully | Planned |  |  |

## Completion Targets
- P0: 100% automated and passing
- P1: >=95% passing, with documented accepted exceptions
