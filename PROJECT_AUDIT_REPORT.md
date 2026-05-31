PROJECT AUDIT REPORT — Smart Canteen Management Ecosystem

SUMMARY

This audit analyzes the full project in D:\\canteen_test (admin dashboard, mobile app, backend). It focuses on functionality, integration gaps, security and deployment readiness and produces a prioritized set of remaining tasks for demo/production readiness.

**SECTION 1: Working Features**
- **Auth (backend)**: JWT-based register/login and `/api/auth` endpoints implemented. See [canteen-backend/app/routes/auth.py](canteen-backend/app/routes/auth.py).
- **Menu & Combos (backend + admin)**: Full CRUD routes for menu items and combos exist (`/api/menu`, `/api/combos`). See [canteen-backend/app/routes/menu.py](canteen-backend/app/routes/menu.py) and [canteen-backend/app/routes/combo.py](canteen-backend/app/routes/combo.py).
- **Orders (backend)**: Order creation, listing, detail and status endpoints implemented (`/api/orders`). See [canteen-backend/app/routes/order.py](canteen-backend/app/routes/order.py).
- **Wallet (backend)**: Wallet creation, balance, history and PIN flows implemented (`/api/wallet`). See [canteen-backend/app/routes/wallet.py](canteen-backend/app/routes/wallet.py).
- **Payment (backend)**: Wallet and UPI payment endpoints implemented; wallet deduction atomicity checks present. See [canteen-backend/app/services/payment_service.py](canteen-backend/app/services/payment_service.py).
- **QR (backend)**: QR generation and verification implemented, QR images encoded as base64. See [canteen-backend/app/services/qr_service.py](canteen-backend/app/services/qr_service.py).
- **Admin UI integration**: Admin frontend (`canteen-admin`) uses `apiClient` and implements pages for live orders, menu, combos, wallet, QR verify. See [canteen-admin/src/api/index.ts](canteen-admin/src/api/index.ts).
- **Mobile app basics**: Mobile app (`canteen-frontend`) has API service, hooks and screens for menu, combos, cart, wallet, QR scanning, and order lifecycle. See [canteen-frontend/src/services/apiService.js](canteen-frontend/src/services/apiService.js) and [canteen-frontend/src/hooks/useApi.js](canteen-frontend/src/hooks/useApi.js).

**SECTION 2: Partially Working Features**
- **Admin RBAC / Authorization**: Admin role checks are implemented but intentionally relaxed in places (demo helpers). Many admin routes currently depend on `get_current_user` instead of `get_current_admin` (see TODOs). See [canteen-backend/app/routes/*](canteen-backend/app/routes).
- **Payment gateway**: UPI flow is simulated (string match check) — for basic demos it works, but there is no real gateway integration. See mock in [canteen-backend/app/services/payment_service.py](canteen-backend/app/services/payment_service.py).
- **Admin live orders resilience**: Admin hook `useOrders` has robust retry + mock fallback; the real-time experience depends on backend reliability. See [canteen-admin/src/hooks/useOrders.ts](canteen-admin/src/hooks/useOrders.ts).
- **Mobile order-status update mismatch**: Mobile `apiService.updateOrderStatus` uses `PUT /orders/{id}/status` while backend implements `PATCH /orders/{id}/status`. Admin uses `PATCH`. This may intermittently break mobile-driven status changes. See [canteen-frontend/src/services/apiService.js](canteen-frontend/src/services/apiService.js) and [canteen-backend/app/routes/order.py](canteen-backend/app/routes/order.py).

**SECTION 3: Broken Features**
- **HTTP verb mismatch for order status**: `PUT /orders/{id}/status` (mobile) is not implemented by backend (backend exposes `PATCH`). This causes 405 errors for mobile PUT calls.
- **Admin-only flows allowed to regular users (demo mode)**: Several endpoints intended for admin/staff use `get_current_user` and accept the demo `mock-jwt-token`, enabling non-admin verification/privileged actions during demo. See [canteen-backend/app/core/dependencies.py](canteen-backend/app/core/dependencies.py) and TODO comments in route files.

**SECTION 4: Missing Features**
- **Production payment gateway**: No real payment gateway (UPI/Razorpay/Stripe) integration — only simulated logic.
- **Email verification / password reset**: No endpoints or workflows for email verification, password reset, or invitation flows.
- **Admin user management CRUD**: Admin can list users but cannot edit roles, deactivate accounts, or delete users via API. See [canteen-admin/src/api/index.ts](canteen-admin/src/api/index.ts) using only GET `/users`.
- **Audit / activity logs**: No centralized audit trail for admin actions or payment events.
- **Rate limiting & throttling**: No middleware or rate limiting configuration (important for public endpoints).
- **Environment/example files**: No `.env.example` or documented secrets/config for production in repo.

**SECTION 5: Mock Components Still Present**
- **Mock admin JWT**: `mock-jwt-token` demo helper in [canteen-backend/app/core/dependencies.py](canteen-backend/app/core/dependencies.py).
- **UPI mock**: UPI success/failure simulated by checking if `upi_id` contains the word `fail`. See [canteen-backend/app/services/payment_service.py](canteen-backend/app/services/payment_service.py).
- **Admin UI mock orders**: `MOCK_ORDERS` fallback inside [canteen-admin/src/hooks/useOrders.ts](canteen-admin/src/hooks/useOrders.ts) (kept intentionally to demo when backend offline).
- **Admin QR mock fallback**: `useQRVerification` contains mock fallback logic when backend unreachable. See [canteen-admin/src/hooks/useQRVerification.ts](canteen-admin/src/hooks/useQRVerification.ts).
- **Mobile hardcoded API host**: Mobile app uses a hard-coded IP `http://192.168.0.149:8000/api` in [canteen-frontend/src/services/api.js](canteen-frontend/src/services/api.js) — demo/dev-only.

**SECTION 6: Missing API Contracts (frontend ↔ backend mismatches)**
- **Order status update verb**: Mobile uses `PUT /orders/{id}/status` while backend expects `PATCH /orders/{id}/status`. (Fix: align mobile to PATCH or add PUT handler.) Files: [canteen-frontend/src/services/apiService.js](canteen-frontend/src/services/apiService.js) and [canteen-backend/app/routes/order.py](canteen-backend/app/routes/order.py).
- **Admin vs user guards**: Several admin actions in routes rely on `get_current_user` instead of `get_current_admin` (intended as demo temporary change) — contract gap for RBAC. See multiple [canteen-backend/app/routes/*.py](canteen-backend/app/routes).
- **Menu list shape**: Admin expects `/menu` return to be an array; some frontend code also expects `{ items, total }` shapes. Backend returns list; frontends attempt to be forgiving but standardizing a paginated response object would remove ambiguity. See [canteen-backend/app/routes/menu.py](canteen-backend/app/routes/menu.py) and [canteen-admin/src/api/index.ts](canteen-admin/src/api/index.ts).

**SECTION 7: Security Issues**
- **Demo token bypass**: `mock-jwt-token` grants admin privileges — critical demo vulnerability. See [canteen-backend/app/core/dependencies.py](canteen-backend/app/core/dependencies.py).
- **Weak default secret**: `JWT_SECRET_KEY` default is "change-this-secret-key" in [canteen-backend/app/core/config.py](canteen-backend/app/core/config.py) — must be replaced in env for prod.
- **CORS wide-open**: `CORSMiddleware` configured with allow_origins=["*"] in [canteen-backend/app/main.py](canteen-backend/app/main.py), allowing any origin.
- **No rate-limiting or brute-force protections**: No sign of IP throttling or login attempt limits.
- **Sensitive defaults in repo**: No `.env.example` but default DB URI and weak secret suggest sensitive config may be easily misused.

**SECTION 8: Deployment Readiness**
- **Missing deployment manifests**: No Dockerfile, docker-compose, `requirements.txt` or `pyproject.toml` at repository root for reproducible deployment. README references `requirements.txt` but the file is absent.
- **Environment management**: No `.env.example` or clear instructions for secrets and production environment variables. See [canteen-backend/app/core/config.py](canteen-backend/app/core/config.py).
- **Hardcoded mobile base URL**: Mobile app uses a dev IP; requires environment config for production. See [canteen-frontend/src/services/api.js](canteen-frontend/src/services/api.js).
- **Third-party integrations missing**: Real payment gateway and (optional) SMS/email providers are not integrated.

**SECTION 9: Top 10 Remaining Tasks**
1. **(P0)** Remove demo token bypass and restore RBAC — replace `mock-jwt-token` shortcuts and enforce `get_current_admin` where needed. Files: [canteen-backend/app/core/dependencies.py](canteen-backend/app/core/dependencies.py), routes with TODOs.
2. **(P0)** Fix HTTP verb mismatch: support `PUT /orders/{id}/status` or change mobile `PUT` to `PATCH` to match backend. Files: [canteen-frontend/src/services/apiService.js](canteen-frontend/src/services/apiService.js).
3. **(P0)** Replace default JWT secret and document required env vars; add `.env.example`. File: [canteen-backend/app/core/config.py](canteen-backend/app/core/config.py).
4. **(P0)** Integrate a production payment gateway (UPI/Stripe/Razorpay) and remove string-based simulation in `payment_service`. See [canteen-backend/app/services/payment_service.py](canteen-backend/app/services/payment_service.py).
5. **(P1)** Harden CORS and add rate-limiting / brute-force protections; configure allowed origins in env. File: [canteen-backend/app/main.py](canteen-backend/app/main.py).
6. **(P1)** Add admin user management endpoints (role updates, deactivate, delete) and corresponding admin UI flows. See admin API area in [canteen-admin/src/api/index.ts](canteen-admin/src/api/index.ts).
7. **(P1)** Provide deployment assets: `Dockerfile`, `docker-compose.yml`, and `requirements.txt` / `pyproject.toml`. Update README with deployment steps.
8. **(P2)** Implement email verification / password reset flows and transactional email provider integration.
9. **(P2)** Standardize API pagination/response contracts (return `{items, total, hasMore}` consistently for lists).
10. **(P2)** Replace admin & mobile mock fallbacks (MOCK_ORDERS, QR mock) with controlled feature flags and clear offline mode UX.

**SECTION 10: Priority Ranking (P0/P1/P2)**
- P0 (Demo Blocker / Production showstopper): 1, 2, 3, 4 — security and core payments/auth.
- P1 (Important): 5, 6, 7 — hardening, admin tooling, deployment.
- P2 (Nice to have): 8, 9, 10 — UX improvements and API polish.

ADDITIONAL NOTES / RISKS
- Demo-mode fallbacks are convenient for demos but present a major demo→prod risk if left enabled; they should be feature-flagged and disabled by default in any production deploy.
- Data model inconsistencies: backend sometimes stores both `status` and `order_status` and frontend reads either; standardize on one canonical field to avoid confusion in UIs and status transitions. Search: `order_status` vs `status` across codebase.
- Test coverage: I did not find unit or integration tests for critical flows (payments, wallet, auth). Adding tests will reduce demo risk.

RECOMMENDED NEXT STEPS (short-term)
- Immediately disable `mock-jwt-token` and re-run admin flows (P0).
- Align order status HTTP method (P0).
- Add `.env.example` and rotate the `JWT_SECRET_KEY` then document in README (P0/P1).
- Prepare a basic Dockerfile and requirements file for the backend (P1).

If you want, I can now:
- Generate a hardened checklist and incremental PR plan to close P0/P1 items, or
- Create a minimal `env.example`, `requirements.txt` and a Dockerfile draft (analysis-only artifacts) for your review.

End of report.
