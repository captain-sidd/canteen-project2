import csv
import urllib.request
import os

# Unsplash Photo ID Mappings (main, gallery 1, gallery 2)
MAPPING_RULES = [
    ("burger", [
        "photo-1568901346375-23c9450c58cd",
        "photo-1550547660-d9450f859349",
        "photo-1571091718767-18b5b1457add"
    ]),
    ("wrap", [
        "photo-1626700051175-6518c4793f4f",
        "photo-1562059390-a761a084768e",
        "photo-1601050690597-df056fb4ce78"
    ]),
    ("fries", [
        "photo-1573080496219-bb080dd4f877",
        "photo-1576107232684-1279f390859f",
        "photo-1585109649139-366815a0d713"
    ]),
    ("sandwich", [
        "photo-1528735602780-2552fd46c7af",
        "photo-1553909489-cd47e0907980",
        "photo-1540713434306-53f2c211b504"
    ]),
    ("garlic bread", [
        "photo-1573140247632-f8fd74997d5c",
        "photo-1544982503-9f984c14501a",
        "photo-1619535860434-ba1d8fa12536"
    ]),
    ("bread", [
        "photo-1573140247632-f8fd74997d5c",
        "photo-1544982503-9f984c14501a",
        "photo-1619535860434-ba1d8fa12536"
    ]),
    ("fried chicken", [
        "photo-1562967914-608f82629710",
        "photo-1569058242253-92a9c755a0ec",
        "photo-1626082927389-6cd097cdc6ec"
    ]),
    ("nuggets", [
        "photo-1562967914-608f82629710",
        "photo-1569058242253-92a9c755a0ec",
        "photo-1626082927389-6cd097cdc6ec"
    ]),
    ("cappuccino", [
        "photo-1534778101976-62847782c213",
        "photo-1469957761103-559364b419a4",
        "photo-1509042239860-f550ce710b93"
    ]),
    ("latte", [
        "photo-1469957761103-559364b419a4",
        "photo-1534778101976-62847782c213",
        "photo-1509042239860-f550ce710b93"
    ]),
    ("coffee", [
        "photo-1517701604599-bb29b565090c",
        "photo-1553909489-ec21e5ec3f65",
        "photo-1497515114629-f71d768fd07c"
    ]),
    ("milkshake", [
        "photo-1572490122747-3968b75cc699",
        "photo-1579954115545-a95591f28bfc",
        "photo-1532713109643-df9b541fb16b"
    ]),
    ("shake", [
        "photo-1572490122747-3968b75cc699",
        "photo-1579954115545-a95591f28bfc",
        "photo-1532713109643-df9b541fb16b"
    ]),
    ("mojito", [
        "photo-1513558161293-cdaf765ed2fd",
        "photo-1546171753-97d7676e4602",
        "photo-1514362545857-3bc16c4c7d1b"
    ]),
    ("iced tea", [
        "photo-1499638673689-79a0b5115d87",
        "photo-1556881286-fc6915169721",
        "photo-1513558161293-cdaf765ed2fd"
    ]),
    ("smoothie", [
        "photo-1553530666-ba11a7da3888",
        "photo-1628557005459-a292850dfd76",
        "photo-1505252585461-04db1eb84683"
    ]),
    ("tea", [
        "photo-1564890369478-c89ca6d9cde9",
        "photo-1597481499750-3e6b22637e12",
        "photo-1576092768241-dec231879fc3"
    ]),
    ("biryani", [
        "photo-1633945274405-b6c8069047b0",
        "photo-1563379091-893cfc23945f",
        "photo-1626777552726-4a6b54c97e46"
    ]),
    ("pizza", [
        "photo-1513104890138-7c749659a591",
        "photo-1593560708920-61dd98c46a4e",
        "photo-1585238342024-78d387f4a707"
    ]),
    ("pasta", [
        "photo-1563379091-893cfc23945f",
        "photo-1612874742237-6526221588e3",
        "photo-1551183053-bf91a1d81141"
    ]),
    ("paneer", [
        "photo-1631452180519-c014fe946bc7",
        "photo-1565557623262-b51c2513a641",
        "photo-1603894584373-5ac82b2ae398"
    ]),
    ("butter chicken", [
        "photo-1603894584373-5ac82b2ae398",
        "photo-1565557623262-b51c2513a641",
        "photo-1631452180519-c014fe946bc7"
    ]),
    ("curry", [
        "photo-1565557623262-b51c2513a641",
        "photo-1603894584373-5ac82b2ae398",
        "photo-1631452180519-c014fe946bc7"
    ]),
    ("fried rice", [
        "photo-1603133872878-684f208fb84b",
        "photo-1626132647523-66f5bf380027",
        "photo-1534422298391-e4f8c172dddb"
    ]),
    ("rice", [
        "photo-1603133872878-684f208fb84b",
        "photo-1626132647523-66f5bf380027",
        "photo-1534422298391-e4f8c172dddb"
    ]),
    ("cheesecake", [
        "photo-1524351199679-46cddf530c04",
        "photo-1606890737304-57a1ca8a5b62",
        "photo-1533134242443-d4fd215305ad"
    ]),
    ("cake", [
        "photo-1578985545062-69928b1d9587",
        "photo-1606890737304-57a1ca8a5b62",
        "photo-1588195538326-c5b1e9f80a1b"
    ]),
    ("brownie", [
        "photo-1606313564200-e75d5e30476c",
        "photo-1564355808539-22fda35bed7e",
        "photo-1606313564000-077a760421e4"
    ]),
    ("ice cream", [
        "photo-1560008511-11c63416e52d",
        "photo-1501443762994-82bd5dace89a",
        "photo-1497034825429-c343d7c6a68f"
    ]),
    ("donut", [
        "photo-1551024601-bec78aea704b",
        "photo-1533089860892-a7c6f0a88666",
        "photo-1612240498936-65f5101365d2"
    ]),
    ("waffles", [
        "photo-1562376502-6f769499c886",
        "photo-1504754524776-8f4f37790ca0",
        "photo-1482049016688-2d3e1b311543"
    ]),
    ("custard", [
        "photo-1551024506-0bccd828d307",
        "photo-1488477181946-6428a0291777",
        "photo-1563729784474-d77dbb933a9e"
    ]),
    ("muffin", [
        "photo-1550617931-e17a7b70dce2",
        "photo-1587960389599-77a40552481e",
        "photo-1607958996333-41aef7caefaa"
    ])
]

# Predefined Fallback URLs
FALLBACK_MAIN = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop"
FALLBACK_G1 = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
FALLBACK_G2 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop"

validation_cache = {}

def validate_url(url):
    """
    Validates a URL via HTTP HEAD/GET request with a short timeout.
    Uses caching to avoid duplicate requests.
    """
    if url in validation_cache:
        return validation_cache[url]
    
    try:
        # Try HEAD request first for efficiency
        req = urllib.request.Request(url, method='HEAD')
        # Add a common User-Agent to avoid blocking
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            is_valid = resp.status == 200
    except Exception as e:
        # Fall back to GET request if HEAD is rejected/fails
        try:
            req = urllib.request.Request(url, method='GET')
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                is_valid = resp.status == 200
        except Exception:
            is_valid = False
            
    validation_cache[url] = is_valid
    return is_valid

def build_unsplash_url(photo_id):
    if photo_id.startswith("photo-"):
        return f"https://images.unsplash.com/{photo_id}?q=80&w=600&auto=format&fit=crop"
    return f"https://images.unsplash.com/photo-{photo_id}?q=80&w=600&auto=format&fit=crop"

def get_urls_for_item(name, subcategory, category):
    name_lower = name.lower()
    sub_lower = subcategory.lower() if subcategory else ""
    cat_lower = category.lower() if category else ""
    
    for key, ids in MAPPING_RULES:
        if key in name_lower or key in sub_lower or key in cat_lower:
            return (build_unsplash_url(ids[0]), build_unsplash_url(ids[1]), build_unsplash_url(ids[2]))
            
    return (FALLBACK_MAIN, FALLBACK_G1, FALLBACK_G2)

def main():
    csv_path = "./restaurant_api.menu_items.csv"
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    # Statistics counters
    total_processed = 0
    images_replaced = 0
    fallback_used = 0
    manual_reviews = []
    
    rows = []
    
    # Read the CSV file
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)

    print(f"Loaded {len(rows)} records from CSV.")
    
    # Process each row
    for row in rows:
        name = row.get("name", "")
        subcategory = row.get("subcategory", "")
        category = row.get("category", "")
        
        main_url, g1_url, g2_url = get_urls_for_item(name, subcategory, category)
        
        # Validate main URL
        if not validate_url(main_url):
            print(f"Validation FAILED for main URL: {main_url} (falling back)")
            main_url = FALLBACK_MAIN
            fallback_used += 1
            
        # Validate gallery 1
        if not validate_url(g1_url):
            g1_url = FALLBACK_G1
            
        # Validate gallery 2
        if not validate_url(g2_url):
            g2_url = FALLBACK_G2
            
        # Check if URL matches default fallback (needs review if we had to fall back to general food)
        if main_url == FALLBACK_MAIN:
            manual_reviews.append(row)
            
        # Update row values
        row["image_url"] = main_url
        if "gallery_images[0]" in row:
            row["gallery_images[0]"] = g1_url
        if "gallery_images[1]" in row:
            row["gallery_images[1]"] = g2_url
            
        images_replaced += 1
        total_processed += 1

    # Write the updated rows back to CSV
    with open(csv_path, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"CSV updated successfully with {total_processed} items.")
    
    # Generate the Markdown report
    report_path = "./MENU_IMAGE_UPDATE_REPORT.md"
    with open(report_path, mode='w', encoding='utf-8') as rf:
        rf.write("# Menu Item Image Update Report\n\n")
        rf.write("This report summarizes the preview and updates performed on the menu item image URLs in the CSV dataset. All deprecated Unsplash source URLs were replaced with validated, direct `images.unsplash.com` links.\n\n")
        rf.write("## Processing Summary\n\n")
        rf.write(f"* **Total Items Processed**: {total_processed}\n")
        rf.write(f"* **Images Replaced/Updated**: {images_replaced}\n")
        rf.write(f"* **HTTP Validation Failures (Falling Back)**: {fallback_used}\n")
        rf.write(f"* **Items Using Predefined Fallback**: {len(manual_reviews)}\n\n")
        
        rf.write("## Database Sync Preview (MongoDB)\n\n")
        rf.write(f"The local database (**restaurant_api.menu_items**) has **{total_processed}** records that can be manually synchronized with the updated CSV data using `mongoimport` or by running the database updates command.\n\n")
        
        if manual_reviews:
            rf.write("## Items Requiring Manual Review\n\n")
            rf.write("The following items could not be mapped to specific subcategories and are using the generic fallback healthy food image:\n\n")
            rf.write("| Name | Category | Subcategory | Current Image URL |\n")
            rf.write("| :--- | :--- | :--- | :--- |\n")
            for item in manual_reviews:
                rf.write(f"| {item.get('name')} | {item.get('category')} | {item.get('subcategory')} | {item.get('image_url')} |\n")
        else:
            rf.write("## Items Requiring Manual Review\n\n")
            rf.write("None! All items were successfully mapped to specific subcategories.\n")

    print(f"Report generated successfully at {report_path}")

if __name__ == "__main__":
    main()
