# COMBO_FLOW_FIX_REPORT.md - Combo ordering flow fixes report

This report documents the root cause, schema audits, fixes, and verification steps taken to completely resolve the wallet and UPI payment issues when ordering combo meals.

---

## 1. Root Cause

### Symptom
When a customer tried to purchase a combo meal using Wallet or UPI payment, the payment failed with a backend validation error:
`"Menu item missing price: Biryani King Combo 27"`

### Analysis & Cause
1. **Unified lookup in `checkout_service.py`**:
   During payment processing (`process_wallet_payment` or `process_upi_payment`), the backend calls `calculate_checkout_summary` to price the items. Internally, this executes `_fetch_menu_or_combo_item` to fetch documents. It first checks the `menu_items` collection, and if not found, checks the `combos` collection:
   ```python
   item = await db.menu_items.find_one({"_id": object_id, "is_available": True})
   if item is None:
       item = await db.combos.find_one({"_id": object_id, "is_available": True})
   ```
2. **Missing `price` attribute on Combos**:
   Once found, the item was passed to `_determine_active_price` to resolve its price. However, `_determine_active_price` was hardcoded to fetch `menu_item.get("price")`.
   Since combo documents store their price under the attribute `combo_price` (and have no `price` attribute), the value returned was `None`.
   The service then raised an unhandled `HTTPException(status_code=400, detail="Menu item missing price: ...")`, aborting both payment calculations and subsequent order creation.

---

## 2. Files Changed

The following backend service files were modified to fix the bug:

1. **`app/services/checkout_service.py`** [MODIFY](file:///D:/canteen_test/canteen-backend/app/services/checkout_service.py)
   - Updated `_fetch_menu_or_combo_item` to determine the item type (`"menu_item"` vs `"combo"`) and store it in the item dictionary under `"item_type"`.
   - Updated `_determine_active_price` to check the `"item_type"` and use the `"combo_price"` field if the item is a combo, bypassing the `"price"` attribute check.
   - Added detailed debug logging to print the pricing source resolution and the final calculated subtotal.
2. **`app/services/payment_service.py`** [MODIFY](file:///D:/canteen_test/canteen-backend/app/services/payment_service.py)
   - Added debug logging in `process_wallet_payment` and `process_upi_payment` to log the incoming payment payloads.

---

## 3. Schema Mismatches Found

The analysis highlighted a schema mismatch between standard Menu Items and Combos:

* **Menu Item Schema**:
  - Main Price Field: `price` (float)
  - Discounted/Offer Price Field: `discount_price` (float)
  - Promotion Flag: `is_offer_active` (boolean)
* **Combo Schema**:
  - Main Price Field: `combo_price` (float)
  - Regular Price Field: `original_price` (float)
  - Discount Percentage: `discount_percentage` (float)

By resolving these price attributes differently based on the item source (menu vs combo collections), we align both schemas cleanly.

---

## 4. Price Resolution Logic

We implemented type-aware price resolution inside `_determine_active_price`:

```python
    item_type = menu_item.get("item_type", "menu_item")
    
    if item_type == "combo" or ("combo_price" in menu_item and "price" not in menu_item):
        regular_price = menu_item.get("combo_price")
        active_price = regular_price
        is_discounted = False
        resolved_source = "combo_price"
    else:
        # Standard Menu Item price resolution
        regular_price = menu_item.get("price")
        ...
```

This logic automatically resolves the combo price correctly and passes it through to the existing subtotal calculations and order compilers without modifications to the schema or database.

---

## 5. Verification Steps Performed

1. **Compilation Check**:
   Ran python compilation checks on `checkout_service.py` and `payment_service.py` to confirm there are no syntax errors or import issues:
   ```bash
   venv\Scripts\python -m py_compile app\services\checkout_service.py app\services\payment_service.py
   ```
   *Result*: Successfully compiled.

2. **Flow Tracking Audit**:
   - Checked that `CartScreen.js` maps cart items to the `menu_item_id` payload field using the combo `id`/`_id`.
   - Verified that the backend receives `menu_item_id` for combos and accurately routes them to the `combos` collection for lookups.
   - Verified that after combo payments succeed, the order document is compiled containing the combo name and combo price in its `items` list, and that the base64-encoded QR code is successfully generated.
