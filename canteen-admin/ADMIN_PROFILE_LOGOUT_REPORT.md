# Admin Profile & Logout Report

## 1. Authentication flow
- Auth state is stored in `localStorage` under `admin_token` and `admin_user`.
- `src/context/AuthContext.tsx` restores session on page load by checking these values.
- `Login.tsx` uses `authApi.login()` to authenticate, then calls `login(access_token, user)` to persist the session.
- The API client automatically attaches the token to requests and logs the user out if a 401 response occurs.

## 2. User dropdown implementation
- Added a profile dropdown in `src/components/layout/TopNavbar.tsx`.
- The dropdown shows:
  - Profile image (if available)
  - Name
  - Email
  - Role
- Dropdown actions include:
  - Profile
  - Settings
  - Logout
- `Profile` already exists at `src/pages/profile/Profile.tsx` and is linked from the menu.

## 3. Logout implementation
- Logout is handled by `AuthContext.logout()`.
- Logout actions:
  - Remove `admin_token` and `admin_user` from `localStorage`
  - Clear React Query cache with `queryClient.clear()`
  - Reset auth state in context
  - Redirect to `/login`
- The top navbar logout menu item now calls this flow.

## 4. Notification implementation
- Added a notification bell to `src/components/layout/TopNavbar.tsx`.
- Uses live order data via `useOrders()`:
  - Pending orders
  - Ready orders
- Uses inventory query data via `inventoryApi.getAll()` to compute low-stock alerts.
- The dropdown shows three operational event cards:
  - New Orders
  - Ready Orders
  - Low Stock Alerts
- Notification count badge updates dynamically from live data.

## 5. Files modified
- `src/context/AuthContext.tsx`
- `src/components/layout/TopNavbar.tsx`
- `src/pages/profile/Profile.tsx`
- `src/App.tsx`

## 6. Verification results
- `npm run build` succeeded in `canteen-admin` with no TypeScript or Vite compile errors.
- Verified login path and protected dashboard flow via existing auth logic.
- Verified profile dropdown and logout menu are compiled and included in the top navbar.
- Verified session persistence via `AuthContext` localStorage restore.
