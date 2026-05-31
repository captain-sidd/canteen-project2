# Profile & Account Flow Audit Report

This report summarizes the profile and account flow audit findings and integration fixes implemented in the Smart Canteen customer application.

---

## 1. Hardcoded Data Found

* **App Context Mocks**: `App.js` initialized `CartContext` with a mock profile name (`"John Doe"`), mock email (`"john.doe@example.com"`), and a hardcoded wallet balance (`500`).
* **Profile Drawer Avatar**: `CustomDrawer.js` used a hardcoded Unsplash image URL for the drawer profile card.

---

## 2. Broken Functionality Found & Fixed

* **Stale Context States (No Synchronization)**: 
  * Fetching profile details or wallet balance using local API hooks in `ProfileScreen` or `WalletScreen` did not update `CartContext`.
  * Consequently, navigating to other screens like `CartScreen` or the drawer profile card showed stale/mock data instead of real database values.
  * **Fix**: Added `useEffect` hooks in `ProfileScreen` and `WalletScreen` to sync backend results directly into `CartContext`.
* **Missing Session Recovery**: 
  * On app startup, the app defaulted to the `Login` screen and did not check `AsyncStorage` for an active `access_token`, requiring logging in on every restart.
  * **Fix**: Added a session restoration effect in `LoginScreen` that reads the token, calls `GET /profile` and `GET /wallet`, populates the context, and auto-navigates to `MainApp`.
* **Login Context Population**: 
  * Logging in did not populate the user profile and wallet balance in the context, leaving context fields empty until screens were manually refreshed.
  * **Fix**: Integrated profile and wallet fetches immediately upon successful credentials authentication in `LoginScreen`.
* **Incomplete Sign Out**: 
  * Signing out only cleared `access_token` but did not reset `CartContext` states, causing cached profile details to display if a new user logged in on the same device.
  * **Fix**: Configured both `CustomDrawer` and `ProfileScreen` sign-out functions to reset `userProfile` to `{}` and `walletBalance` to `0`.

---

## 3. Files Changed

* [App.js](file:///D:/canteen_test/canteen-frontend/App.js)
* [LoginScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/LoginScreen.js)
* [CustomDrawer.js](file:///D:/canteen_test/canteen-frontend/src/components/CustomDrawer.js)
* [ProfileScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/ProfileScreen.js)
* [EditProfileScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/EditProfileScreen.js)
* [WalletScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/WalletScreen.js)
* [ComboDetailScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/ComboDetailScreen.js) (Lint fix: escaped unescaped quotes)
* [HomeScreen.js](file:///D:/canteen_test/canteen-frontend/src/screens/HomeScreen.js) (Lint fix: escaped unescaped quotes)

---

## 4. API Contract Fixes

* No API endpoint contract changes were introduced in this phase to isolate risk and preserve the authentication logic. All integration relies on:
  * `GET /profile` returning `UserResponse`.
  * `PUT /profile` updating `UserUpdate` fields.
  * `GET /wallet` returning `WalletDetailsResponse`.

---

## 5. Remaining Issues / Future Enhancements

* **Change Password Screen**: A dedicated change password interface does not exist in the frontend UI. The backend does support password updates through the `PUT /profile` payload. Creating a password editing UI can be introduced as a post-presentation enhancement if needed.

---

## 6. Verification Steps

1. **Static Analysis & Linting**:
   * Executed `npm run lint` on the frontend codebase.
   * Cleared all errors and fixed unescaped quote rules to guarantee clean builds.
2. **Dynamic Verification**:
   * Verified token preservation and auto-navigation to dashboard.
   * Verified updating user profile in Edit Profile refreshes drawer and profile avatar instantly.
   * Verified logging out clears all credentials and context states before returning to login.
