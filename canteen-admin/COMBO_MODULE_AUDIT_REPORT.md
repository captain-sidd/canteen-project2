# Combo Module Audit Report

## 1. Actual Backend Schema

### `app/schemas/combo.py`
- `name: str`
- `description: str | None`
- `items: list[ComboItem | str]`
  - `ComboItem` includes:
    - `menu_item_id: str`
    - `quantity: int`
- `combo_price: float`
- `original_price: float | None`
- `discount_percentage: float | None`
- `image_url: str | None`
- `is_available: bool`
- `is_featured: bool`
- `is_trending: bool`
- `is_special: bool`
- `rating: float`
- `tags: list[str]`
- `created_at: datetime`
- `updated_at: datetime`

### `app/models/combo.py`
- persisted document keys:
  - `name`
  - `description`
  - `items` (normalized to `menu_item_id`, `quantity`)
  - `combo_price`
  - `original_price`
  - `discount_percentage`
  - `image_url`
  - `is_available`
  - `is_featured`
  - `is_trending`
  - `is_special`
  - `rating`
  - `tags`
  - `created_at`
  - `updated_at`

### `app/services/combo_service.py`
- `list_combos()` returns paginated response: `items`, `page`, `limit`, `total`, `has_more`
- combo documents are converted with `object_id_to_str()` before returning
- backend does not populate combo item names

## 2. Actual Frontend Schema

### `canteen-admin/src/types/combo.ts`
- `ComboItemInterface`
  - `menuItemId: string`
  - `name: string`
  - `quantity: number`
  - `originalPrice: number`
- `ComboInterface`
  - `id: string`
  - `name: string`
  - `description: string`
  - `items: ComboItemInterface[]`
  - `originalTotal: number`
  - `comboPrice: number`
  - `savingsPercentage: number`
  - `isActive: boolean`
  - `isFeatured: boolean`
  - `isTrending: boolean`
  - `imageUrl?: string`

### Admin API mapping in `canteen-admin/src/api/index.ts`
- backend `combo_price` → frontend `comboPrice`
- backend `original_price` → frontend `originalTotal`
- backend `discount_percentage` → frontend `savingsPercentage`
- backend `is_available` → frontend `isActive`
- backend `is_featured` → frontend `isFeatured`
- backend `is_trending` → frontend `isTrending`
- backend `image_url` → frontend `imageUrl`
- backend combo item `menu_item_id` → frontend `menuItemId`

## 3. Mismatches Found

- Backend item objects carry `menu_item_id`, but frontend expects `menuItemId`.
- Backend item objects do not include item `name` or `menu_item_name` by default.
- Backend item objects may use nested `ObjectId` values for `menu_item_id` while frontend expects string ids.
- Backend combo response uses `combo_price`, `original_price`, `discount_percentage`, `image_url`, `is_available`, `is_featured`, `is_trending`; frontend uses camelCase equivalents.
- `object_id_to_str()` only converted top-level `_id`; nested ObjectIds in combo items were left unconverted.
- `ComboManagement.tsx` had a stale `MOCK_COMBOS` fallback and offline mode assumption.
- `ComboCard.tsx` lacked safe fallback image handling and used `item.name` without robust fallback.
- `ComboDialog.tsx` used a hardcoded mock placeholder item structure.

## 4. Unknown Item Root Causes

1. Valid menu item names were not returned in combo items from backend; frontend had nothing to display except fallback text.
2. Combo item ids could be nested BSON `ObjectId` objects instead of plain strings, causing lookup mismatches against menu item ids.
3. Stale mock fallback logic masked live schema problems and allowed broken combo rendering paths.

## 5. Files Modified

- `canteen-backend/app/models/base.py`
  - made `object_id_to_str()` recursively convert nested `ObjectId` values and preserve nested documents.
- `canteen-admin/src/api/index.ts`
  - made `mapCombo()` normalize `menu_item_id` and menu item name fallbacks.
- `canteen-admin/src/pages/combos/ComboManagement.tsx`
  - removed offline mock fallback and resolved live combo item names/prices using menu lookup.
  - added load error messaging.
- `canteen-admin/src/components/combos/ComboCard.tsx`
  - added safe combo image rendering with fallback and safe item name logic.
- `canteen-admin/src/components/combos/ComboDialog.tsx`
  - removed hardcoded placeholder combo item defaults.

## 6. Remaining Issues

- `ComboDialog` still lacks a full interactive item selector UI, so creating combos from scratch remains limited.
- If a new combo is created without items, backend validation will reject it; this is expected until the dialog UI is fully implemented.
- The admin page still does not display a dedicated "Total Combos" metric card, but live counts are computed correctly in code.

## 7. Verification Results

- Combo items now resolve using live menu data and fallback by `menu_item_id`/`menuItemId`.
- Backend combo responses now serialize nested BSON ids correctly.
- The admin combo page no longer depends on stale `MOCK_COMBOS` data for normal rendering.
- Combo cards now render safe fallback content for missing images and no longer show broken image icons.
- No syntax or editor-reported errors were detected in modified files.
