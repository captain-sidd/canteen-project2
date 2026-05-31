import urllib.request
import re

urls = [
    ("burger main", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"),
    ("burger g1", "https://images.unsplash.com/photo-1550547660-d9450f859349"),
    ("burger g2", "https://images.unsplash.com/photo-1571091718767-18b5b1457add"),
    
    ("wrap main", "https://images.unsplash.com/photo-1626700051175-6518c4793f4f"),
    ("wrap g1", "https://images.unsplash.com/photo-1562059390-a761a084768e"),
    ("wrap g2", "https://images.unsplash.com/photo-1601050690597-df056fb4ce78"),
    
    ("fries main", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877"),
    ("fries g1", "https://images.unsplash.com/photo-1576107232684-1279f390859f"),
    ("fries g2", "https://images.unsplash.com/photo-1585109649139-366815a0d713"),
    
    ("sandwich main", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af"),
    ("sandwich g1", "https://images.unsplash.com/photo-1553909489-cd47e0907980"),
    ("sandwich g2", "https://images.unsplash.com/photo-1540713434306-53f2c211b504"),
    
    ("garlic bread main", "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c"),
    ("garlic bread g1", "https://images.unsplash.com/photo-1544982503-9f984c14501a"),
    ("garlic bread g2", "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536"),
    
    ("nuggets main", "https://images.unsplash.com/photo-1562967914-608f82629710"),
    ("nuggets g1", "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec"),
    ("nuggets g2", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec"),
    
    ("coffee main", "https://images.unsplash.com/photo-1517701604599-bb29b565090c"),
    ("coffee g1", "https://images.unsplash.com/photo-1553909489-ec21e5ec3f65"),
    ("coffee g2", "https://images.unsplash.com/photo-1497515114629-f71d768fd07c"),
    
    ("cappuccino main", "https://images.unsplash.com/photo-1534778101976-62847782c213"),
    ("cappuccino g1", "https://images.unsplash.com/photo-1469957761103-559364b419a4"),
    ("cappuccino g2", "https://images.unsplash.com/photo-1509042239860-f550ce710b93"),
    
    ("milkshake main", "https://images.unsplash.com/photo-1572490122747-3968b75cc699"),
    ("milkshake g1", "https://images.unsplash.com/photo-1579954115545-a95591f28bfc"),
    ("milkshake g2", "https://images.unsplash.com/photo-1532713109643-df9b541fb16b"),
    
    ("mojito main", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd"),
    ("mojito g1", "https://images.unsplash.com/photo-1546171753-97d7676e4602"),
    ("mojito g2", "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b"),
    
    ("iced tea main", "https://images.unsplash.com/photo-1499638673689-79a0b5115d87"),
    ("iced tea g1", "https://images.unsplash.com/photo-1556881286-fc6915169721"),
    
    ("smoothie main", "https://images.unsplash.com/photo-1553530666-ba11a7da3888"),
    ("smoothie g1", "https://images.unsplash.com/photo-1628557005459-a292850dfd76"),
    ("smoothie g2", "https://images.unsplash.com/photo-1505252585461-04db1eb84683"),
    
    ("tea main", "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9"),
    ("tea g1", "https://images.unsplash.com/photo-1597481499750-3e6b22637e12"),
    ("tea g2", "https://images.unsplash.com/photo-1576092768241-dec231879fc3"),
    
    ("biryani main", "https://images.unsplash.com/photo-1633945274405-b6c8069047b0"),
    ("biryani g1", "https://images.unsplash.com/photo-1563379091-893cfc23945f"),
    ("biryani g2", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46"),
    
    ("pizza main", "https://images.unsplash.com/photo-1513104890138-7c749659a591"),
    ("pizza g1", "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e"),
    ("pizza g2", "https://images.unsplash.com/photo-1585238342024-78d387f4a707"),
    
    ("pasta main", "https://images.unsplash.com/photo-1563379091-893cfc23945f"),
    ("pasta g1", "https://images.unsplash.com/photo-1612874742237-6526221588e3"),
    ("pasta g2", "https://images.unsplash.com/photo-1551183053-bf91a1d81141"),
    
    ("curry main", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7"),
    ("curry g1", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398"),
    ("curry g2", "https://images.unsplash.com/photo-1565557623262-b51c2513a641"),
    
    ("rice main", "https://images.unsplash.com/photo-1603133872878-684f208fb84b"),
    ("rice g1", "https://images.unsplash.com/photo-1626132647523-66f5bf380027"),
    ("rice g2", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb"),
    
    ("cake main", "https://images.unsplash.com/photo-1578985545062-69928b1d9587"),
    ("cake g1", "https://images.unsplash.com/photo-1524351199679-46cddf530c04"),
    ("cake g2", "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62"),
    
    ("brownie main", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c"),
    ("brownie g1", "https://images.unsplash.com/photo-1564355808539-22fda35bed7e"),
    ("brownie g2", "https://images.unsplash.com/photo-1606313564000-077a760421e4"),
    
    ("ice cream main", "https://images.unsplash.com/photo-1560008511-11c63416e52d"),
    ("ice cream g1", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a"),
    ("ice cream g2", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f"),
    
    ("donut main", "https://images.unsplash.com/photo-1551024601-bec78aea704b"),
    ("donut g1", "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666"),
    ("donut g2", "https://images.unsplash.com/photo-1612240498936-65f5101365d2"),
    
    ("waffles main", "https://images.unsplash.com/photo-1562376502-6f769499c886"),
    ("waffles g1", "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0"),
    ("waffles g2", "https://images.unsplash.com/photo-1482049016688-2d3e1b311543"),
    
    ("custard main", "https://images.unsplash.com/photo-1551024506-0bccd828d307"),
    ("custard g1", "https://images.unsplash.com/photo-1488477181946-6428a0291777"),
    ("custard g2", "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"),
    
    ("muffin main", "https://images.unsplash.com/photo-1550617931-e17a7b70dce2"),
    ("muffin g1", "https://images.unsplash.com/photo-1587960389599-77a40552481e"),
    ("muffin g2", "https://images.unsplash.com/photo-1607958996333-41aef7caefaa")
]

for label, url in urls:
    try:
        photo_id = url.split("photo-")[1].split("?")[0]
        # Unsplash HTML page URL
        page_url = f"https://unsplash.com/photos/{photo_id}"
        req = urllib.request.Request(page_url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')
        
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            title_match = re.search(r"<title>(.*?)</title>", html)
            title = title_match.group(1) if title_match else "No Title"
            # Print if it contains common human terms or just print everything for debugging
            if any(term in title.lower() for term in ["woman", "girl", "man", "boy", "person", "portrait", "people"]):
                print(f"⚠️ MATCH [{label}] ({url}): {title}")
            else:
                print(f"[{label}]: {title[:50]}")
    except Exception as e:
        print(f"ERROR [{label}] ({url}): {e}")
