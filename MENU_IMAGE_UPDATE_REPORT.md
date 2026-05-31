# Menu Item Image Update Report

This report summarizes the preview and updates performed on the menu item image URLs in the CSV dataset. All deprecated Unsplash source URLs were replaced with validated, direct `images.unsplash.com` links.

## Processing Summary

* **Total Items Processed**: 100
* **Images Replaced/Updated**: 100
* **HTTP Validation Failures (Falling Back)**: 17
* **Items Using Predefined Fallback**: 17

## Database Sync Preview (MongoDB)

The local database (**restaurant_api.menu_items**) has **100** records that can be manually synchronized with the updated CSV data using `mongoimport` or by running the database updates command.

## Items Requiring Manual Review

The following items could not be mapped to specific subcategories and are using the generic fallback healthy food image:

| Name | Category | Subcategory | Current Image URL |
| :--- | :--- | :--- | :--- |
| Paneer Wrap 3 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Chicken Wrap 4 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Cafe Latte 13 | drinks | coffee | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| White Sauce Pasta 25 | meals | pasta | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Chicken Alfredo Pasta 26 | meals | pasta | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Blueberry Cheesecake 32 | desserts | cheesecake | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Waffles with Syrup 38 | desserts | waffles | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Paneer Wrap 43 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Chicken Wrap 44 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Cafe Latte 53 | drinks | coffee | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| White Sauce Pasta 65 | meals | pasta | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Chicken Alfredo Pasta 66 | meals | pasta | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Blueberry Cheesecake 76 | desserts | cheesecake | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Waffles with Syrup 78 | desserts | waffles | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Paneer Wrap 83 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Chicken Wrap 84 | snacks | wrap | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
| Cafe Latte 93 | drinks | coffee | https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop |
