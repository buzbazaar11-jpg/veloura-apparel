"""
Seed script to:
1. Unpublish ~36 existing watch/perfume products (active = False) - kept in DB and admin panel
2. Unpublish existing collections (active = False) - kept in DB and admin panel
3. Unpublish old watch/perfume categories (active = False)
4. Add 4 new Men's Collections (active = True)
5. Add/ensure 6 Men's Categories (active = True)
6. Add 20 new Men's Products (each with >= 3 images, active = True)
7. Update Hero Slides with Men's Apparel slides (active = True)
Updates both Supabase PostgreSQL and local SQLite veloura.db.
"""
import os
import sys
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath('backend'))
from app.models import Product, Collection, Category, HeroSlide

load_dotenv('backend/.env')

NOW = datetime.now(timezone.utc)

COLLECTIONS_DATA = [
    {
        "id": str(uuid.uuid4()),
        "name": "Men's Leather Collection",
        "slug": "mens-leather-collection",
        "tagline": "Mastercrafted genuine leather jackets & outerwear",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
        "sort_order": 1,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Shirts & Overshirts Edit",
        "slug": "shirts-overshirts-edit",
        "tagline": "Clean draping, structured twill, and timeless button-downs",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
        "sort_order": 2,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pants & Tailored Trousers",
        "slug": "pants-tailored-trousers",
        "tagline": "Everyday chinos, cargo utility, and relaxed pleated tailoring",
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=80",
        "sort_order": 3,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Complete Men's Outfits",
        "slug": "complete-mens-outfits",
        "tagline": "Curated seasonal looks, layering essentials, and modern silhouettes",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
        "sort_order": 4,
        "active": True
    }
]

CATEGORIES_DATA = [
    {
        "id": str(uuid.uuid4()),
        "name": "Leather Jackets",
        "slug": "leather-jackets",
        "description": "Premium genuine leather biker, bomber, racer and aviator jackets",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
        "sort_order": 1,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Shirts",
        "slug": "shirts",
        "description": "Crisp Oxford button-downs, utility twill overshirts, linen and corduroy",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
        "sort_order": 2,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Trousers & Pants",
        "slug": "trousers-pants",
        "description": "Pleated tailored trousers, relaxed chinos, cargo pants, and selvedge denim",
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=80",
        "sort_order": 3,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Men's Outfits",
        "slug": "mens-outfits",
        "description": "Curated two-piece suits, coordinated sets, and complete looks",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
        "sort_order": 4,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Hoodies & Knitwear",
        "slug": "hoodies-knitwear",
        "description": "Heavyweight luxury cotton hoodies, merino sweaters, and knit cardigans",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
        "sort_order": 5,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Jackets & Outerwear",
        "slug": "jackets-outerwear",
        "description": "Tailored wool overcoats, technical storm shells, and winter coats",
        "image_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80",
        "sort_order": 6,
        "active": True
    }
]

HERO_SLIDES_DATA = [
    {
        "id": str(uuid.uuid4()),
        "eyebrow": "AUTUMN / WINTER 2026",
        "title": "THE MEN'S LEATHER & APPAREL EDIT",
        "title_accent": "VELOURA APPAREL",
        "description": "Mastercrafted genuine leather jackets, crisp layered overshirts, and relaxed tailored trousers built for modern everyday elegance.",
        "cta_label": "Shop Collection",
        "cta_href": "/collections",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&auto=format&fit=crop&q=85",
        "sort_order": 1,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "eyebrow": "CONTEMPORARY SILHOUETTES",
        "title": "CURATED MEN'S OUTFITS",
        "title_accent": "NEW ARRIVALS",
        "description": "Effortless styling from day to night with premium natural fibers, considered drape, and unmatched hand-finished detailing.",
        "cta_label": "Explore Outfits",
        "cta_href": "/shop",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&auto=format&fit=crop&q=85",
        "sort_order": 2,
        "active": True
    },
    {
        "id": str(uuid.uuid4()),
        "eyebrow": "EVERYDAY ESSENTIALS",
        "title": "SHIRTS, CHINOS & TAILORED DRAPE",
        "title_accent": "VELOURA APPAREL",
        "description": "Discover breathable Oxford weaves, heavy twill utility cuts, and clean tailored fits crafted for confidence.",
        "cta_label": "Discover Now",
        "cta_href": "/shop",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&auto=format&fit=crop&q=85",
        "sort_order": 3,
        "active": True
    }
]

PRODUCTS_DATA = [
    # ── Leather Jackets (4) ───────────────────────────────────────────────────
    {
        "name": "Veloura Signature Biker Leather Jacket",
        "slug": "veloura-signature-biker-leather-jacket",
        "brand": "Veloura Apparel",
        "collection": "Men's Leather Collection",
        "category": "Leather Jackets",
        "product_type": "apparel",
        "price": 13990,
        "sale_price": 11490,
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Black", "Charcoal"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "features": ["100% Genuine Full-Grain Leather", "Heavy-Duty YKK Hardware", "Quilted Viscose Thermal Lining", "Asymmetrical Biker Zip"],
        "stock": 35,
        "description": "An iconic menswear silhouette precision-crafted from supple full-grain cowhide. Features an asymmetrical front zipper, notch lapels with snap hardware, and zippered cuffs. Designed to break in beautifully and develop a rich patina with wear.",
        "featured": True,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 48,
        "sort_order": 1,
        "badge": "Signature"
    },
    {
        "name": "Veloura Vintage Suede Bomber Jacket",
        "slug": "veloura-vintage-suede-bomber-jacket",
        "brand": "Veloura Apparel",
        "collection": "Men's Leather Collection",
        "category": "Leather Jackets",
        "product_type": "apparel",
        "price": 14490,
        "sale_price": 12990,
        "image_url": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Tobacco Tan", "Dark Brown"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["Ultra-Soft Goatskin Suede", "Ribbed Wool-Blend Hem & Cuffs", "Dual Slanted Welt Pockets", "Interior Passport Pocket"],
        "stock": 28,
        "description": "Cut from velvety goatskin suede with a plush, luxurious hand feel. Features a clean ribbed baseball collar, elasticated cuffs, and a smooth satin interior. Elevates casual denim or tailored trousers with effortless vintage charm.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 32,
        "sort_order": 2,
        "badge": "Best Seller"
    },
    {
        "name": "Veloura Cafe Racer Minimalist Leather Jacket",
        "slug": "veloura-cafe-racer-minimalist-leather-jacket",
        "brand": "Veloura Apparel",
        "collection": "Men's Leather Collection",
        "category": "Leather Jackets",
        "product_type": "apparel",
        "price": 12990,
        "sale_price": 10490,
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Midnight Black", "Espresso"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["Streamlined Band Collar with Snap Closure", "Hand-Waxed Leather Finish", "Dual Vertical Chest Pockets", "Gusseted Action Back"],
        "stock": 42,
        "description": "Minimalist design meeting heritage motorcycle craftsmanship. The Café Racer is stripped of unnecessary details for an athletic, tapered silhouette with clean lines and understated tonal hardware.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 29,
        "sort_order": 3
    },
    {
        "name": "Veloura Aviator Shearling Leather Jacket",
        "slug": "veloura-aviator-shearling-leather-jacket",
        "brand": "Veloura Apparel",
        "collection": "Men's Leather Collection",
        "category": "Leather Jackets",
        "product_type": "apparel",
        "price": 16990,
        "sale_price": 14990,
        "image_url": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Dark Walnut", "Black"],
        "sizes": ["M", "L", "XL", "XXL"],
        "features": ["Heavyweight Nappa Leather Outer", "Genuine High-Pile Shearling Collar", "Buckled Throat Latch & Waist Tabs", "Storm Flap Front Closure"],
        "stock": 20,
        "description": "The quintessential cold-weather statement piece. Built from heavy-duty textured nappa leather and lined with thick thermal shearling. Engineered to provide maximum wind resistance and warmth while commanding unmistakable presence.",
        "featured": True,
        "new_arrival": True,
        "rating": 5.0,
        "reviews": 19,
        "sort_order": 4,
        "badge": "Luxury"
    },

    # ── Shirts & Overshirts (5) ───────────────────────────────────────────────
    {
        "name": "Veloura Classic Oxford Button-Down Shirt",
        "slug": "veloura-classic-oxford-button-down-shirt",
        "brand": "Veloura Apparel",
        "collection": "Shirts & Overshirts Edit",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 4490,
        "sale_price": 3790,
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Crisp White", "Sky Blue", "Light Grey"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "features": ["100% Long-Staple Combed Cotton", "Substantial Oxford Basketweave", "Pearlized Buttons", "Box Pleat with Locker Loop"],
        "stock": 65,
        "description": "The quintessential tailored staple. Woven from durable long-staple cotton in a classic Oxford basketweave. Features a rolling button-down collar, single chest pocket, and a clean curved hem for wearing tucked or untucked.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 56,
        "sort_order": 5,
        "badge": "Wardrobe Staple"
    },
    {
        "name": "Veloura Heavyweight Twill Utility Overshirt",
        "slug": "veloura-heavyweight-twill-utility-overshirt",
        "brand": "Veloura Apparel",
        "collection": "Shirts & Overshirts Edit",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 5490,
        "sale_price": 4690,
        "image_url": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Military Olive", "Charcoal", "Stone Sand"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["320 GSM Cotton Twill", "Dual Gusseted Flap Pockets", "Horn-Style Matte Buttons", "Reinforced Elbow Patches"],
        "stock": 50,
        "description": "Designed to straddle the line between a heavy shirt and a light jacket. Cut boxy and relaxed through the body to comfortably layer over tees and knitwear throughout transitional seasons.",
        "featured": True,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 38,
        "sort_order": 6,
        "badge": "New Arrival"
    },
    {
        "name": "Veloura Relaxed Camp-Collar Linen Shirt",
        "slug": "veloura-relaxed-camp-collar-linen-shirt",
        "brand": "Veloura Apparel",
        "collection": "Shirts & Overshirts Edit",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 4990,
        "sale_price": 4190,
        "image_url": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Natural Sand", "Ivory White", "Sage Green"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["100% Pure Normandy Linen", "Relaxed Retro Cuban Collar", "Straight Split Hem", "Breathable Airy Weave"],
        "stock": 45,
        "description": "Carefree summer tailoring at its finest. Woven from breathable pure linen, pre-washed for extra softness. The relaxed camp collar and straight hem deliver an effortlessly sharp vacation aesthetic.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.7,
        "reviews": 24,
        "sort_order": 7
    },
    {
        "name": "Veloura Ribbed Corduroy Workshirt",
        "slug": "veloura-ribbed-corduroy-workshirt",
        "brand": "Veloura Apparel",
        "collection": "Shirts & Overshirts Edit",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 5290,
        "sale_price": 4490,
        "image_url": "https://images.unsplash.com/photo-1620012253295-c15c429fcc71?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Caramel Brown", "Forest Green", "Navy"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["8-Wale Textured Cotton Corduroy", "Buttoned Double Chest Pockets", "Soft Velveteen Touch", "Heavy Reinforced Seams"],
        "stock": 38,
        "description": "Rich texture meets everyday utility. Crafted in mid-weight cotton corduroy with thick wales that catch the light. Perfect worn open over a white tee or buttoned up under a wool overcoat.",
        "featured": False,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 31,
        "sort_order": 8
    },
    {
        "name": "Veloura Brushed Flannel Plaid Overshirt",
        "slug": "veloura-brushed-flannel-plaid-overshirt",
        "brand": "Veloura Apparel",
        "collection": "Shirts & Overshirts Edit",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 4890,
        "sale_price": 3990,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Monochrome Charcoal", "Deep Navy / Brown"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "features": ["Double-Brushed 100% Cotton Flannel", "Understated Check Pattern", "Dual Pen-Slot Chest Pockets", "Drop-Tail Hem"],
        "stock": 55,
        "description": "Ultra-soft brushed flannel designed in sophisticated monochrome tones. Double-brushed for warmth without bulk, offering everyday comfort and rugged elegance.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 40,
        "sort_order": 9
    },

    # ── Trousers & Pants (4) ──────────────────────────────────────────────────
    {
        "name": "Veloura Pleated Relaxed Tailored Trousers",
        "slug": "veloura-pleated-relaxed-tailored-trousers",
        "brand": "Veloura Apparel",
        "collection": "Pants & Tailored Trousers",
        "category": "Trousers & Pants",
        "product_type": "apparel",
        "price": 5990,
        "sale_price": 4990,
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Slate Charcoal", "Midnight Black", "Warm Taupe"],
        "sizes": ["30", "32", "34", "36", "38"],
        "features": ["Single Inward Front Pleats", "Slight Taper from Knee to Hem", "Concealed Extension Waistband", "Creased Front Legs"],
        "stock": 48,
        "description": "Modern tailoring redefined. Featuring single front pleats, clean side adjusters, and a subtle taper. Constructed from a fluid wool-viscose blend that drapes gracefully over sneakers or dress boots.",
        "featured": True,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 44,
        "sort_order": 10,
        "badge": "Bestseller"
    },
    {
        "name": "Veloura Wide-Leg Utility Cargo Pants",
        "slug": "veloura-wide-leg-utility-cargo-pants",
        "brand": "Veloura Apparel",
        "collection": "Pants & Tailored Trousers",
        "category": "Trousers & Pants",
        "product_type": "apparel",
        "price": 5490,
        "sale_price": 4690,
        "image_url": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Desert Khaki", "Washed Olive", "Black"],
        "sizes": ["30", "32", "34", "36"],
        "features": ["Heavy Cotton Ripstop Fabric", "Articulated Knee Seams", "Adjustable Drawstring Ankle Cuffs", "Deep Bellowed Cargo Pockets"],
        "stock": 52,
        "description": "Contemporary utility cut with a roomy wide-leg silhouette. Engineered from high-density cotton ripstop with darted knees and drawstring ankle ties allowing easy silhouette adjustments.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 37,
        "sort_order": 11
    },
    {
        "name": "Veloura Tailored Stretch Chino Pants",
        "slug": "veloura-tailored-stretch-chino-pants",
        "brand": "Veloura Apparel",
        "collection": "Pants & Tailored Trousers",
        "category": "Trousers & Pants",
        "product_type": "apparel",
        "price": 4790,
        "sale_price": 3990,
        "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Deep Navy", "British Khaki", "Concrete Grey"],
        "sizes": ["30", "32", "34", "36", "38"],
        "features": ["98% Combed Cotton, 2% Spandex", "Clean Flat-Front Finish", "Welt Back Pockets", "Pre-Shrunk Garment Wash"],
        "stock": 60,
        "description": "Your go-to pant for 7-day-a-week versatility. Tailored slim through the thigh with just enough stretch for complete freedom of movement. Dressed up with a shirt or dressed down with a tee.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.7,
        "reviews": 51,
        "sort_order": 12
    },
    {
        "name": "Veloura Straight-Leg Selvedge Denim Jeans",
        "slug": "veloura-straight-leg-selvedge-denim-jeans",
        "brand": "Veloura Apparel",
        "collection": "Pants & Tailored Trousers",
        "category": "Trousers & Pants",
        "product_type": "apparel",
        "price": 6490,
        "sale_price": 5490,
        "image_url": "https://images.unsplash.com/photo-1542272604-780c96856592?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Raw Indigo", "Vintage Stonewash"],
        "sizes": ["30", "32", "34", "36", "38"],
        "features": ["13.5 oz Shuttle-Loomed Selvedge", "Custom Copper Rivets & Button Fly", "Classic Red-Line Selvedge ID", "Chain-Stitched Hems"],
        "stock": 40,
        "description": "Crafted from authentic shuttle-loomed Japanese selvedge denim. Clean straight fit with a mid rise that pairs seamlessly with boots and minimalist sneakers. Molds to your body shape with every wear.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.9,
        "reviews": 63,
        "sort_order": 13,
        "badge": "Heritage Denim"
    },

    # ── Outfits, Hoodies & Layering (4) ──────────────────────────────────────
    {
        "name": "Veloura 450 GSM French Terry Core Hoodie",
        "slug": "veloura-450-gsm-french-terry-core-hoodie",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Hoodies & Knitwear",
        "product_type": "apparel",
        "price": 5490,
        "sale_price": 4490,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Washed Vintage Black", "Oatmeal Heather", "Forest Moss"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "features": ["450 GSM Heavyweight French Terry", "Double-Layered Structured Hood", "Seamless Kangaroo Pocket", "Ribbed Side Gusset Panels"],
        "stock": 70,
        "description": "The definitive luxury hoodie. Substantial, weighted drape with custom side gussets for enhanced drape. Keeps its structural boxy shape wash after wash without sagging or pilling.",
        "featured": True,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 84,
        "sort_order": 14,
        "badge": "Top Rated"
    },
    {
        "name": "Veloura Ribbed Merino Wool Crewneck Sweater",
        "slug": "veloura-ribbed-merino-wool-crewneck-sweater",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Hoodies & Knitwear",
        "product_type": "apparel",
        "price": 6990,
        "sale_price": 5890,
        "image_url": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Ecru / Cream", "Charcoal Melange", "Camel"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["100% Extra-Fine Merino Wool", "Thermoregulating Natural Yarn", "Chunky Ribbed Neckline and Hem", "Zero-Itch Hand Feel"],
        "stock": 35,
        "description": "Spun from 19.5-micron extrafine merino wool for pure cloud-like softness against the skin. Natural thermal regulation keeps you cozy in cool weather while remaining completely breathable indoors.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.9,
        "reviews": 27,
        "sort_order": 15
    },
    {
        "name": "Veloura Milano Knit Full-Zip Cardigan",
        "slug": "veloura-milano-knit-full-zip-cardigan",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Hoodies & Knitwear",
        "product_type": "apparel",
        "price": 7290,
        "sale_price": 6190,
        "image_url": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Midnight Navy", "Black"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["Dense Milano Stitch Construction", "Two-Way Silver Metal Zipper", "Stand Funnel Collar", "Structured Clean Hem"],
        "stock": 30,
        "description": "Sharp architectural knitwear. The dense Milano stitch creates a blazer-like firmness while retaining knit comfort. Features a versatile two-way zipper allowing custom styling from neck to waist.",
        "featured": False,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 19,
        "sort_order": 16
    },
    {
        "name": "Veloura Heavyweight Boxy Drop-Shoulder Tee",
        "slug": "veloura-heavyweight-boxy-drop-shoulder-tee",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Shirts",
        "product_type": "apparel",
        "price": 2890,
        "sale_price": 2290,
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Chalk White", "Washed Charcoal", "Olive"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "features": ["280 GSM Organic Carded Cotton", "Reinforced 1-Inch Ribbed Collar", "Drop Shoulders with Wider Sleeves", "Preshrunk Heavyweight Drape"],
        "stock": 80,
        "description": "The ultimate heavyweight t-shirt. Cut in a contemporary boxy silhouette that drapes off the shoulders without clinging. Substantial collar stays flat and sharp throughout daily wear.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.8,
        "reviews": 92,
        "sort_order": 17,
        "badge": "Essential"
    },

    # ── Complete Outfits, Suits & Outerwear (3) ───────────────────────────────
    {
        "name": "Veloura Relaxed Two-Piece Tailored Suit",
        "slug": "veloura-relaxed-two-piece-tailored-suit",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Men's Outfits",
        "product_type": "apparel",
        "price": 18990,
        "sale_price": 15990,
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Slate Grey", "Midnight Black"],
        "sizes": ["38R/30", "40R/32", "42R/34", "44R/36"],
        "features": ["Unstructured Deconstructed Blazer", "Matching Pleated Relaxed Trousers", "Italian Wool-Blend Fabric", "Patch Pockets with Soft Shoulders"],
        "stock": 22,
        "description": "Effortless sartorial poise. Deconstructed without stiff shoulder pads or heavy canvassing, giving you complete freedom while looking immaculately tailored. Includes matching relaxed pleated trousers.",
        "featured": True,
        "new_arrival": True,
        "rating": 5.0,
        "reviews": 35,
        "sort_order": 18,
        "badge": "Signature Outfit"
    },
    {
        "name": "Veloura Double-Breasted Camel Wool Overcoat",
        "slug": "veloura-double-breasted-camel-wool-overcoat",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Jackets & Outerwear",
        "product_type": "apparel",
        "price": 17490,
        "sale_price": 14990,
        "image_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Camel Tan", "Charcoal Melange"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["70% Melton Wool, 30% Cashmere Blend", "Peak Lapels & Horn Buttons", "Deep Center Back Vent", "Interior Insulated Bemberg Lining"],
        "stock": 25,
        "description": "An imposing, elegant outerwear investment. Tailored in an elongated double-breasted cut with dramatic peak lapels. Instantly pulls together any casual outfit or tailored suit underneath.",
        "featured": True,
        "new_arrival": False,
        "rating": 4.9,
        "reviews": 41,
        "sort_order": 19,
        "badge": "Statement Piece"
    },
    {
        "name": "Veloura Technical Storm Shell Windbreaker",
        "slug": "veloura-technical-storm-shell-windbreaker",
        "brand": "Veloura Apparel",
        "collection": "Complete Men's Outfits",
        "category": "Jackets & Outerwear",
        "product_type": "apparel",
        "price": 8490,
        "sale_price": 6990,
        "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=900&auto=format&fit=crop&q=80"
        ],
        "colors": ["Matte Olive", "Obsidian Black"],
        "sizes": ["S", "M", "L", "XL"],
        "features": ["10K Waterproof / 10K Breathable Membrane", "Fully Taped Aquaguard Seams", "Packable Ergonomic Storm Hood", "Laser-Cut Underarm Ventilation"],
        "stock": 45,
        "description": "Engineered protection with an urban aesthetic. Constructed with a 3-layer technical waterproof shell, matte taping, and ergonomic articulators. Lightweight and packable without sacrificing weather resistance.",
        "featured": False,
        "new_arrival": True,
        "rating": 4.8,
        "reviews": 28,
        "sort_order": 20
    }
]

def seed_database(db_url: str, is_sqlite: bool = False):
    print(f"\nConnecting to: {db_url[:40]}...")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    engine = create_engine(db_url, connect_args=connect_args)
    
    with Session(engine) as session:
        try:
            # 1. Unpublish existing products (do NOT delete!)
            n_prod = session.query(Product).update({Product.active: False})
            print(f"Unpublished {n_prod} existing products (kept in DB & admin panel).")
            
            # 2. Unpublish existing collections (do NOT delete!)
            n_coll = session.query(Collection).update({Collection.active: False})
            print(f"Unpublished {n_coll} existing collections (kept in DB & admin panel).")

            # 3. Unpublish old watch and perfume categories
            n_cats = session.query(Category).filter(
                Category.slug.in_(['strap-watches', 'chain-watches', 'arabic-dial', 'mens-perfume', 'womens-perfume', 'gift-sets'])
            ).update({Category.active: False}, synchronize_session=False)
            print(f"Unpublished {n_cats} old watch/perfume categories.")

            # 4. Upsert/Insert 4 Men's collections
            for c in COLLECTIONS_DATA:
                obj = session.query(Collection).filter_by(slug=c["slug"]).first()
                if obj:
                    obj.name = c["name"]
                    obj.tagline = c["tagline"]
                    obj.image_url = c["image_url"]
                    obj.sort_order = c["sort_order"]
                    obj.active = True
                else:
                    session.add(Collection(
                        id=uuid.UUID(c["id"]),
                        name=c["name"],
                        slug=c["slug"],
                        tagline=c["tagline"],
                        image_url=c["image_url"],
                        sort_order=c["sort_order"],
                        active=True
                    ))
            print(f"Active Men's collections synchronized: {len(COLLECTIONS_DATA)}")

            # 5. Upsert/Insert Men's categories
            for cat in CATEGORIES_DATA:
                obj = session.query(Category).filter_by(slug=cat["slug"]).first()
                if obj:
                    obj.name = cat["name"]
                    obj.description = cat["description"]
                    obj.image_url = cat["image_url"]
                    obj.sort_order = cat["sort_order"]
                    obj.active = True
                else:
                    session.add(Category(
                        id=uuid.UUID(cat["id"]),
                        name=cat["name"],
                        slug=cat["slug"],
                        description=cat["description"],
                        image_url=cat["image_url"],
                        sort_order=cat["sort_order"],
                        active=True
                    ))
            print(f"Active Men's categories synchronized: {len(CATEGORIES_DATA)}")

            # 6. Insert 20 new Men's products
            for p in PRODUCTS_DATA:
                obj = session.query(Product).filter_by(slug=p["slug"]).first()
                data = {
                    "slug": p["slug"],
                    "name": p["name"],
                    "brand": p["brand"],
                    "collection": p["collection"],
                    "category": p["category"],
                    "product_type": p["product_type"],
                    "price": p["price"],
                    "sale_price": p.get("sale_price"),
                    "compare_at": p["price"] + 2000,
                    "image_url": p["image_url"],
                    "gallery": p["gallery"],
                    "colors": p["colors"],
                    "sizes": p["sizes"],
                    "features": p["features"],
                    "stock": p["stock"],
                    "description": p["description"],
                    "featured": p.get("featured", False),
                    "new_arrival": p.get("new_arrival", False),
                    "active": True,
                    "sort_order": p["sort_order"],
                    "rating": p.get("rating", 4.8),
                    "reviews": p.get("reviews", 30),
                    "badge": p.get("badge")
                }
                if obj:
                    for k, v in data.items():
                        setattr(obj, k, v)
                else:
                    session.add(Product(**data))
            print(f"20 Men's products synchronized successfully!")

            # 7. Update hero slides (unpublish old watch slides, insert/update 3 Men's apparel slides)
            session.query(HeroSlide).update({HeroSlide.active: False})
            for s in HERO_SLIDES_DATA:
                obj = session.query(HeroSlide).filter_by(title=s["title"]).first()
                if obj:
                    obj.eyebrow = s["eyebrow"]
                    obj.title_accent = s["title_accent"]
                    obj.description = s["description"]
                    obj.cta_label = s["cta_label"]
                    obj.cta_href = s["cta_href"]
                    obj.image_url = s["image_url"]
                    obj.sort_order = s["sort_order"]
                    obj.active = True
                else:
                    session.add(HeroSlide(
                        id=uuid.UUID(s["id"]),
                        eyebrow=s["eyebrow"],
                        title=s["title"],
                        title_accent=s["title_accent"],
                        description=s["description"],
                        cta_label=s["cta_label"],
                        cta_href=s["cta_href"],
                        image_url=s["image_url"],
                        sort_order=s["sort_order"],
                        active=True
                    ))
            print(f"Men's Apparel hero slides synchronized: {len(HERO_SLIDES_DATA)}")

            session.commit()
            print("Transaction successfully committed!")
        except Exception as e:
            session.rollback()
            print("ERROR while seeding:", e)
            raise

if __name__ == "__main__":
    # 1. Supabase PostgreSQL
    supabase_url = os.getenv("DATABASE_URL")
    if supabase_url:
        print("--- SEEDING SUPABASE POSTGRESQL ---")
        seed_database(supabase_url, is_sqlite=False)

    # 2. Local SQLite veloura.db
    sqlite_path = "backend/veloura.db"
    if os.path.exists(sqlite_path):
        print("\n--- SEEDING LOCAL SQLITE veloura.db ---")
        seed_database(f"sqlite:///{sqlite_path}", is_sqlite=True)

    print("\nALL DATABASES SUCCESSFULLY UPDATED WITH MEN'S APPAREL & OUTFITS!")
