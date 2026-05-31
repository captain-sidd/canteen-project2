# DEMO READINESS REPORT — Smart Canteen Management

**Date:** May 31, 2026  
**Goal:** Present working end-to-end flows for customer and admin by end of day tomorrow

---

## A. WORKING FOR DEMO ✅

### Customer Flow (Mobile - `canteen-frontend`)
- **Login**: JWT register/login via `/api/auth` ✅  
- **Menu browsing**: `/api/menu` returns items ✅  
- **Combos**: `/api/combos` returns combos ✅  
- **Add to cart**: Local CartContext state ✅  
- **Wallet payment**: PIN-based flow via `/api/payments/wallet-pay` ✅  
- **UPI payment**: Simulated via `/api/payments/upi-pay` ✅  
- **Order creation**: POST `/api/orders` creates order + QR ✅  
- **QR generation**: Automatic in order service, base64 encoded ✅  
- **Order status page**: GET `/api/orders` returns user's orders ✅  

### Admin Flow (Web - `canteen-admin`)
- **Login**: Mock or real JWT via `/api/auth/login` ✅  
- **Live orders view**: GET `/api/orders/all` with polling ✅  
- **Order status updates**: PATCH `/api/orders/{id}/status` ✅  
- **Order progression**: pending → preparing → ready → completed ✅  
- **QR verification**: POST `/api/qr/verify` marks order complete ✅  
- **Menu management**: CRUD via `/api/menu` ✅  
- **Combo management**: CRUD via `/api/combos` ✅  
- **Dashboard stats**: All modules render (Dashboard, Orders, QR, Menu, Combos, Inventory, Wallet, Reports) ✅  

### Backend (`canteen-backend`)
- **All routes mounted**: auth, checkout, combo, menu, order, payment, profile, qr, users, wallet ✅  
- **MongoDB integration**: Connection at startup, indices created ✅  
- **Order lifecycle**: pending → preparing → ready → completed with validation ✅  
- **Wallet deduction**: Atomic balance check during wallet payment ✅  

---

## B. BROKEN FOR DEMO ❌

### 1. **HTTP Verb Mismatch (P0)**
- **Where**: Mobile order status update  
- **Issue**: Mobile sends `PUT /orders/{id}/status` but backend only implements `PATCH`  
- **Impact**: If demo includes "customer updates order status" → 405 error  
- **File**: [canteen-frontend/src/services/apiService.js#L187](canteen-frontend/src/services/apiService.js#L187) uses PUT; backend expects PATCH  
- **Fix**: Change mobile to use PATCH

---

## C. HIGH RISK AREAS ⚠️

### 1. **Hardcoded Mobile IP** (P0 Risk)
- **Issue**: Mobile hardcoded to `http://192.168.0.149:8000/api`  
- **Impact**: If demo network ≠ 192.168.0.149, mobile cannot reach backend  
- **File**: [canteen-frontend/src/services/api.js](canteen-frontend/src/services/api.js)  
- **Status**: Will break demo unless on correct IP network  

### 2. **No Seed Data** (P0 Risk)
- **Issue**: Database starts empty. Menu items must be created before demo.  
- **Impact**: If you skip seed data, "View Menu" shows empty list → immediate demo failure  
- **Solution**: Create menu + combos via admin UI before demo OR manually seed  

### 3. **Backend Must Be Running** (P0 Risk)
- **Impact**: If backend crashes during demo, entire system fails  
- **File**: Backend starts at `uvicorn app.main:app --reload --host 0.0.0.0` port 8000  
- **Status**: No automatic restart; monitor closely  

### 4. **MongoDB Must Be Running** (P0 Risk)
- **Issue**: Default connection: `mongodb://localhost:27017`  
- **Impact**: Any backend call fails if MongoDB is down  
- **Status**: Must verify MongoDB is running before demo starts  

### 5. **Demo Token Bypass** (P0 Security Risk)
- **Issue**: Backend allows `mock-jwt-token` to bypass real auth  
- **Impact**: Anyone can be admin without credentials  
- **File**: [canteen-backend/app/core/dependencies.py](canteen-backend/app/core/dependencies.py#L22)  
- **Status**: OK for demo, but security vulnerability  

### 6. **UPI Payment Mock** (P1 Risk)
- **Issue**: UPI success/failure simulated by checking if UPI ID contains the word "fail"  
- **Example**: UPI ID = "user@failure" → payment fails ✓ (as intended), but "user@upi" → succeeds  
- **Impact**: Unrealistic payment flow; if presenter uses "fail" in UPI ID, demo breaks  
- **File**: [canteen-backend/app/services/payment_service.py](canteen-backend/app/services/payment_service.py#L165)  

### 7. **Admin Mock Data Fallback** (P1 UI Risk)
- **Issue**: If backend is unreachable, admin shows MOCK_ORDERS (demo data)  
- **Impact**: If backend crashes mid-demo, admin continues with stale mock data  
- **File**: [canteen-admin/src/hooks/useOrders.ts](canteen-admin/src/hooks/useOrders.ts#L6)  
- **Status**: Intentional resilience feature; OK for demo  

---

## D. MUST FIX TODAY (P0)

### 1. Fix HTTP Verb Mismatch
**Expected outcome**: Mobile order status update works  
**Action**: Change one line in mobile service  

```javascript
// canteen-frontend/src/services/apiService.js line ~187
// CHANGE FROM:
const response = await api.put(`/orders/${orderId}/status`, { status });
// CHANGE TO:
const response = await api.patch(`/orders/${orderId}/status`, { status });
```

### 2. Create Test Data (Menu + Combos)
**Expected outcome**: Admin can see menu items; customer sees items to order  
**Action**: Use admin UI to create 5-10 menu items + 2-3 combos  

**Example items:**
- Masala Dosa - ₹80
- Veg Burger Combo - ₹120
- Cold Coffee - ₹60
- Chicken Roll - ₹90
- French Fries - ₹40

**Action**: Create via admin Menu Management page OR seed in DB directly

### 3. Verify Network Configuration
**Expected outcome**: Mobile can reach backend  
**Action**: Before demo starts, confirm backend IP matches mobile config  

**Check**:
1. Get backend machine IP: `ipconfig` (Windows)
2. Update [canteen-frontend/src/services/api.js](canteen-frontend/src/services/api.js) line 5 if IP differs
3. Restart mobile app

### 4. Pre-Start Checklist
**Run 30 min before demo:**
```
✓ MongoDB running at localhost:27017
✓ Backend running at 0.0.0.0:8000 (or correct IP)
✓ Admin dashboard accessible at correct URL
✓ Menu items created in database
✓ Mobile app configured with correct backend IP
✓ Test 1 complete order flow (mobile → admin)
```

---

## E. CAN IGNORE UNTIL AFTER PRESENTATION (P2)

- Email verification
- Password reset
- Admin user role management
- Deployment files (Docker, etc.)
- Performance optimization
- Code cleanup / refactoring
- Unit tests
- API documentation
- Security hardening
- CI/CD pipelines

---

## F. TOP 3 REMAINING TASKS (PRIORITY ORDER)

### 1. **FIX HTTP VERB MISMATCH** ⏱️ 5 min
   - **Task**: Change mobile `PUT` to `PATCH`  
   - **File**: [canteen-frontend/src/services/apiService.js](canteen-frontend/src/services/apiService.js)  
   - **Impact**: Prevents 405 errors if mobile tries to update order status  
   - **Test**: Mobile → create order → update status (must not error)  

### 2. **SEED TEST DATA** ⏱️ 10-15 min
   - **Task**: Create 5-10 menu items via admin UI (or DB insert)  
   - **Files**: Use admin → Menu Management page  
   - **Impact**: Demo starts with visible orders; "View Menu" succeeds  
   - **Test**: Admin/mobile menu page shows items  

### 3. **NETWORK & PRE-START VERIFY** ⏱️ 5 min before demo
   - **Task**: Confirm backend IP, MongoDB running, all services up  
   - **Impact**: Demo doesn't crash on startup  
   - **Test**: Mobile can reach API; admin loads live orders  

---

## G. DEMO FLOW CHECKLIST

### Customer Flow (Expected duration: 3 min)
- [ ] Login with test account  
- [ ] Browse menu (verify items load)  
- [ ] View combos  
- [ ] Add 2-3 items to cart  
- [ ] Proceed to wallet payment (or UPI)  
- [ ] Enter wallet PIN (or UPI ID without "fail")  
- [ ] Confirm order created + QR generated  

### Admin Flow (Expected duration: 2 min)
- [ ] Login to dashboard  
- [ ] View live orders (should see order from customer)  
- [ ] Click "Accept" → order status → "preparing"  
- [ ] Click "Ready" → order status → "ready"  
- [ ] QR Verification: Scan customer QR code  
- [ ] Confirm order → "completed"  

### Expected Happy Path
✅ Customer places order → ✅ Admin accepts → ✅ Admin marks ready → ✅ Admin verifies QR → ✅ Order complete

---

## H. IF SOMETHING BREAKS DURING DEMO

| Issue | Symptom | Quick Fix |
|-------|---------|-----------|
| Mobile can't reach backend | "Network Error" in cart | Check IP, restart app |
| Backend crashes | Admin shows "Live Sync Failed" + mock data | Restart backend; sync should restore |
| No menu items shown | Empty menu page | Create menu items via admin UI |
| Order status won't update | Admin can't mark "preparing" | Check backend logs; likely 405 error → fix PUT to PATCH |
| QR verification fails | "Order not found" error | Ensure order was created + QR data matches |
| Wallet payment fails | PIN wrong error | Wallet PIN not set; use wallet UI to set PIN first |

---

## I. SUCCESS CRITERIA

**Demo is ready if:**
1. ✅ Customer can log in
2. ✅ Menu shows 5+ items
3. ✅ Customer can add to cart
4. ✅ Customer can pay (wallet or UPI without "fail" text)
5. ✅ Order created + visible in admin
6. ✅ Admin can update order status: pending → preparing → ready → completed
7. ✅ QR verification marks order completed
8. ✅ No 405 / 404 / 500 errors during happy path

---

## SUMMARY

**Status**: ~85% demo-ready

**Blockers for tomorrow:**
1. **HTTP verb mismatch** → 5 min fix
2. **No test data** → 15 min to create
3. **Network verification** → 5 min check before demo

**Recommendation**: Fix items 1-2 today; do network check 30 min before demo starts.

**Risk level**: LOW if fixed | CRITICAL if not fixed

---

**Next**: Execute the 3 fixes above, then run through customer + admin flow once before presentation.
