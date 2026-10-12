import campaignOne from "@/assets/mens-campaign-street.jpg";
import campaignTwo from "@/assets/mens-campaign-everyday.jpg";
import campaignThree from "@/assets/mens-overshirt.jpg";
import campaignFour from "@/assets/mens-accessories.jpg";
import jacketImage from "@/assets/mens-jacket.jpg";
import teeImage from "@/assets/mens-tee.jpg";
import shirtImage from "@/assets/mens-shirt.jpg";
import cargoImage from "@/assets/mens-cargo.jpg";
import hoodieImage from "@/assets/mens-hoodie.jpg";
import sneakerImage from "@/assets/mens-sneakers.jpg";
import trouserImage from "@/assets/mens-trousers.jpg";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | undefined;
  rating: number;
  reviewCount: number;
  audience: string;
  category: string;
  description: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  mood: "Minimal" | "Street" | "Everyday" | "Elevated";
  fit: string;
  material: string;
  care: string;
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  image: string;
};

export const campaignImages = {
  one: campaignOne,
  two: campaignTwo,
  three: campaignThree,
  four: campaignFour,
};

export const categories = ["Jackets", "T-Shirts", "Shirts", "Trousers", "Hoodies", "Sneakers", "Accessories"];
export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
export const colors = ["Ivory", "Black", "Sage", "Stone", "Charcoal", "Taupe"];
export const moods = ["Minimal", "Street", "Everyday", "Elevated"] as const;

const productDescriptions = {
  outer: "A refined VEL0URA APPAREL essential cut for everyday ease, built around clean lines and quiet detail.",
  shirt: "A breathable staple with a considered drape, designed to move between weekday and evening settings.",
  trouser: "Relaxed tailoring with a polished finish, made for modern wardrobes and effortless pairing.",
  accessory: "A restrained VEL0URA APPAREL finishing piece with a premium hand feel and everyday utility.",
};

const catalog = [
  {
    id: "vl-001",
    name: "VEL0URA APPAREL Signature Jacket",
    slug: "veloura-signature-jacket",
    price: 248,
    category: "Jackets",
    description: productDescriptions.outer,
    images: [campaignOne, campaignTwo, campaignThree],
    colors: ["Ivory", "Black", "Sage"],
    sizes,
    stock: 12,
    tags: ["jacket", "signature", "outerwear", "elevated", "minimal"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    mood: "Elevated",
    fit: "Structured shoulders with a relaxed body and hip-length finish.",
    material: "Italian cotton twill blend with smooth viscose lining.",
    care: "Dry clean preferred. Steam lightly between wears.",
  },
  {
    id: "vl-002",
    name: "VEL0URA APPAREL Essential Oversized Tee",
    slug: "veloura-essential-oversized-tee",
    price: 68,
    category: "T-Shirts",
    description: productDescriptions.shirt,
    images: [campaignTwo, campaignFour, campaignOne],
    colors: ["Ivory", "Sage", "Black"],
    sizes,
    stock: 30,
    tags: ["tee", "t-shirt", "essential", "minimal", "everyday"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    mood: "Everyday",
    fit: "Oversized through the body with a clean dropped shoulder.",
    material: "Heavyweight organic cotton jersey.",
    care: "Machine wash cold. Lay flat to dry.",
  },
  {
    id: "vl-003",
    name: "VEL0URA APPAREL Studio Shirt",
    slug: "veloura-studio-shirt",
    price: 128,
    category: "Shirts",
    description: productDescriptions.shirt,
    images: [campaignTwo, campaignOne, campaignFour],
    colors: ["Ivory", "Stone", "Sage"],
    sizes,
    stock: 18,
    tags: ["shirt", "studio", "work", "minimal"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    mood: "Minimal",
    fit: "Relaxed tailoring with a soft collar and extended cuff.",
    material: "Cotton poplin with a subtle washed finish.",
    care: "Machine wash cold with similar colors.",
  },
  {
    id: "vl-004",
    name: "VEL0URA APPAREL Relaxed Cargo",
    slug: "veloura-relaxed-cargo",
    price: 158,
    category: "Trousers",
    description: productDescriptions.trouser,
    images: [campaignThree, campaignTwo, campaignFour],
    colors: ["Black", "Sage", "Stone"],
    sizes,
    stock: 7,
    tags: ["cargo", "trouser", "street", "relaxed"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    mood: "Street",
    fit: "Mid-rise with a relaxed straight leg and utility pockets.",
    material: "Washed cotton nylon twill.",
    care: "Machine wash cold. Do not tumble dry.",
  },
  {
    id: "vl-005",
    name: "VEL0URA APPAREL Core Hoodie",
    slug: "veloura-core-hoodie",
    price: 138,
    category: "Hoodies",
    description: productDescriptions.outer,
    images: [campaignThree, campaignTwo, campaignOne],
    colors: ["Black", "Charcoal", "Sage"],
    sizes,
    stock: 21,
    tags: ["hoodie", "core", "street", "everyday"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    mood: "Street",
    fit: "Relaxed hooded silhouette with a refined cropped hem.",
    material: "Brushed organic cotton fleece.",
    care: "Machine wash cold inside out.",
  },
  {
    id: "vl-006",
    name: "VEL0URA APPAREL Minimal Runner",
    slug: "veloura-minimal-runner",
    price: 182,
    category: "Sneakers",
    description: productDescriptions.accessory,
    images: [campaignFour, campaignThree, campaignTwo],
    colors: ["Ivory", "Stone", "Black"],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    stock: 14,
    tags: ["sneaker", "runner", "minimal", "shoe"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    mood: "Minimal",
    fit: "True to size with a cushioned low-profile sole.",
    material: "Suede, mesh, and smooth leather panels.",
    care: "Brush gently and spot clean only.",
  },
  {
    id: "vl-007",
    name: "VEL0URA APPAREL Everyday Trouser",
    slug: "veloura-everyday-trouser",
    price: 148,
    category: "Trousers",
    description: productDescriptions.trouser,
    images: [campaignTwo, campaignOne, campaignFour],
    colors: ["Stone", "Black", "Taupe"],
    sizes,
    stock: 24,
    tags: ["trouser", "everyday", "tailored", "elevated"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    mood: "Everyday",
    fit: "Soft wide leg with pressed pleats and an easy waistband.",
    material: "Tencel wool blend with fluid drape.",
    care: "Dry clean or gentle cold wash.",
  },
  {
    id: "vl-008",
    name: "VEL0URA APPAREL Essential Overshirt",
    slug: "veloura-essential-overshirt",
    price: 176,
    category: "Shirts",
    description: productDescriptions.outer,
    images: [campaignFour, campaignTwo, campaignThree],
    colors: ["Sage", "Ivory", "Charcoal"],
    sizes,
    stock: 9,
    tags: ["overshirt", "shirt", "layer", "minimal"],
    featured: false,
    newArrival: true,
    bestSeller: false,
    mood: "Minimal",
    fit: "Boxy layer with dropped shoulders and clean patch pockets.",
    material: "Garment-dyed cotton canvas.",
    care: "Machine wash cold, reshape while damp.",
  },
  {
    id: "vl-009",
    name: "VEL0URA APPAREL Studio Jacket",
    slug: "veloura-studio-jacket",
    price: 268,
    category: "Jackets",
    description: productDescriptions.outer,
    images: [campaignThree, campaignOne, campaignTwo],
    colors: ["Black", "Stone"],
    sizes,
    stock: 4,
    tags: ["jacket", "studio", "street", "signature"],
    featured: true,
    newArrival: false,
    bestSeller: false,
    mood: "Street",
    fit: "Relaxed bomber shape with tonal hardware.",
    material: "Compact cotton sateen with light insulation.",
    care: "Dry clean only.",
  },
  {
    id: "vl-010",
    name: "VEL0URA APPAREL Core Tee",
    slug: "veloura-core-tee",
    price: 58,
    category: "T-Shirts",
    description: productDescriptions.shirt,
    images: [campaignFour, campaignTwo, campaignOne],
    colors: ["Ivory", "Black", "Taupe"],
    sizes,
    stock: 36,
    tags: ["tee", "core", "minimal", "basic"],
    featured: false,
    newArrival: false,
    bestSeller: true,
    mood: "Minimal",
    fit: "Regular fit with a straight hem and rib neck.",
    material: "Compact organic cotton jersey.",
    care: "Machine wash cold.",
  },
  {
    id: "vl-011",
    name: "VEL0URA APPAREL Relaxed Trouser",
    slug: "veloura-relaxed-trouser",
    price: 154,
    category: "Trousers",
    description: productDescriptions.trouser,
    images: [campaignOne, campaignTwo, campaignThree],
    colors: ["Ivory", "Stone", "Black"],
    sizes,
    stock: 16,
    tags: ["trouser", "relaxed", "signature", "elevated"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    mood: "Elevated",
    fit: "Relaxed wide leg with tailored waistband.",
    material: "Cotton wool blend with smooth finish.",
    care: "Dry clean for best shape retention.",
  },
  {
    id: "vl-012",
    name: "VEL0URA APPAREL Relaxed Cotton Tee",
    slug: "veloura-soft-rib-tank",
    price: 52,
    category: "T-Shirts",
    description: productDescriptions.shirt,
    images: [campaignTwo, campaignFour, campaignOne],
    colors: ["Ivory", "Black", "Sage"],
    sizes,
    stock: 28,
    tags: ["tee", "cotton", "minimal", "summer"],
    featured: false,
    newArrival: true,
    bestSeller: false,
    mood: "Everyday",
    fit: "Relaxed men's fit with a clean crew neckline.",
    material: "Soft cotton jersey.",
    care: "Machine wash cold in garment bag.",
  },
  {
    id: "vl-013",
    name: "VEL0URA APPAREL Straight Fit Trouser",
    slug: "veloura-column-skirt",
    price: 132,
    category: "Trousers",
    description: productDescriptions.trouser,
    images: [campaignOne, campaignTwo, campaignFour],
    colors: ["Black", "Taupe"],
    sizes,
    stock: 10,
    tags: ["trouser", "straight", "elevated", "minimal"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    mood: "Elevated",
    fit: "Straight leg with a relaxed tailored waistband.",
    material: "Soft tailoring twill.",
    care: "Dry clean only.",
  },
  {
    id: "vl-014",
    name: "VEL0URA APPAREL Utility Tote",
    slug: "veloura-utility-tote",
    price: 118,
    category: "Accessories",
    description: productDescriptions.accessory,
    images: [campaignFour, campaignTwo, campaignThree],
    colors: ["Sage", "Black", "Stone"],
    sizes: ["ONE SIZE"],
    stock: 20,
    tags: ["tote", "bag", "accessory", "everyday"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    mood: "Everyday",
    fit: "Spacious daily tote with internal slip pocket.",
    material: "Cotton canvas with leather handles.",
    care: "Spot clean with a soft cloth.",
  },
  {
    id: "vl-015",
    name: "VEL0URA APPAREL City Zip Jacket",
    slug: "veloura-tailored-vest",
    price: 146,
    category: "Jackets",
    description: productDescriptions.outer,
    images: [campaignOne, campaignTwo, campaignFour],
    colors: ["Ivory", "Black"],
    sizes,
    stock: 8,
    tags: ["jacket", "zip", "elevated", "minimal"],
    featured: false,
    newArrival: true,
    bestSeller: false,
    mood: "Elevated",
    fit: "Relaxed zip-front silhouette designed for layering.",
    material: "Wool blend suiting with viscose lining.",
    care: "Dry clean only.",
  },
  {
    id: "vl-016",
    name: "VEL0URA APPAREL Draped Shirt",
    slug: "veloura-draped-shirt",
    price: 136,
    category: "Shirts",
    description: productDescriptions.shirt,
    images: [campaignTwo, campaignOne, campaignThree],
    colors: ["Ivory", "Taupe", "Sage"],
    sizes,
    stock: 11,
    tags: ["shirt", "draped", "elevated", "essential"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    mood: "Elevated",
    fit: "Fluid relaxed silhouette with extended back hem.",
    material: "Tencel voile with a soft hand.",
    care: "Hand wash cold or dry clean.",
  },
  {
    id: "vl-017",
    name: "VEL0URA APPAREL City Cap",
    slug: "veloura-city-cap",
    price: 48,
    category: "Accessories",
    description: productDescriptions.accessory,
    images: [campaignFour, campaignThree, campaignTwo],
    colors: ["Sage", "Black", "Ivory"],
    sizes: ["ONE SIZE"],
    stock: 25,
    tags: ["cap", "accessory", "street", "everyday"],
    featured: false,
    newArrival: true,
    bestSeller: false,
    mood: "Street",
    fit: "Adjustable low-profile cap.",
    material: "Washed cotton twill.",
    care: "Spot clean only.",
  },
  {
    id: "vl-018",
    name: "VEL0URA APPAREL Wide Leg Denim",
    slug: "veloura-wide-leg-denim",
    price: 168,
    category: "Trousers",
    description: productDescriptions.trouser,
    images: [campaignThree, campaignOne, campaignTwo],
    colors: ["Charcoal", "Black"],
    sizes,
    stock: 13,
    tags: ["denim", "trouser", "street", "everyday"],
    featured: false,
    newArrival: false,
    bestSeller: true,
    mood: "Street",
    fit: "High-rise wide leg with long inseam.",
    material: "Rigid organic cotton denim.",
    care: "Wash sparingly inside out.",
  },
  {
    id: "vl-019",
    name: "VEL0URA APPAREL Fine Knit Polo",
    slug: "veloura-fine-knit-polo",
    price: 118,
    category: "Shirts",
    description: productDescriptions.shirt,
    images: [campaignTwo, campaignFour, campaignOne],
    colors: ["Sage", "Ivory", "Black"],
    sizes,
    stock: 15,
    tags: ["knit", "polo", "everyday", "minimal"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    mood: "Everyday",
    fit: "Slim relaxed knit with open collar.",
    material: "Cotton cashmere blend.",
    care: "Hand wash cold, dry flat.",
  },
  {
    id: "vl-020",
    name: "VEL0URA APPAREL Leather Belt",
    slug: "veloura-leather-belt",
    price: 78,
    category: "Accessories",
    description: productDescriptions.accessory,
    images: [campaignFour, campaignOne, campaignTwo],
    colors: ["Black", "Taupe"],
    sizes: ["S", "M", "L"],
    stock: 19,
    tags: ["belt", "accessory", "minimal", "elevated"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    mood: "Minimal",
    fit: "Classic width with refined metal buckle.",
    material: "Full-grain leather.",
    care: "Wipe clean and condition occasionally.",
  },
  {
    id: "vl-021",
    name: "VEL0URA APPAREL Cloud Sneaker",
    slug: "veloura-cloud-sneaker",
    price: 196,
    category: "Sneakers",
    description: productDescriptions.accessory,
    images: [campaignFour, campaignTwo, campaignThree],
    colors: ["Ivory", "Sage"],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    stock: 6,
    tags: ["sneaker", "shoe", "everyday", "runner"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    mood: "Everyday",
    fit: "Soft cushioned sole with supportive upper.",
    material: "Leather, suede, and recycled mesh.",
    care: "Spot clean with a damp cloth.",
  },
];

export const articles: Article[] = [
  {
    slug: "style-oversized-jacket",
    category: "Styling",
    title: "How to Style an Oversized Jacket",
    description: "A restrained guide to proportion, layering and clean contrast.",
    image: campaignOne,
  },
  {
    slug: "modern-wardrobe",
    category: "Wardrobe",
    title: "Building a Modern Wardrobe",
    description: "The VEL0URA APPAREL approach to pieces that hold their shape season after season.",
    image: campaignTwo,
  },
  {
    slug: "everyday-dressing",
    category: "Editorial",
    title: "The Art of Everyday Dressing",
    description: "Quiet silhouettes, tactile fabrics and the confidence of simplicity.",
    image: campaignThree,
  },
  {
    slug: "inside-aw26",
    category: "Collection",
    title: "Inside VEL0URA APPAREL AW26",
    description: "A closer look at the muted palette and architectural lines behind the season.",
    image: campaignFour,
  },
  {
    slug: "tone-on-tone",
    category: "Guide",
    title: "The Power of Tone-on-Tone",
    description: "How ivory, stone, sage and black become a complete wardrobe language.",
    image: campaignOne,
  },
];

export const heroSlides = [
  { label: "THE MEN'S EDIT / AW26", headline: "GOOD STYLE. EVERY DAY.", product: "VEL0URA APPAREL men's jacket", text: "Clean tees. Easy layers. Better everyday fits. Find your next look, from weekday to weekend.", cta: "SHOP MEN'S EDIT", ctaPath: "/shop" as const, image: campaignOne },
  { label: "MEN'S NEW ARRIVALS", headline: "YOUR NEXT EVERYDAY FIT.", product: "VEL0URA APPAREL men's shirts", text: "Relaxed shirts and considered layers. Pieces that work together, without overthinking it.", cta: "SHOP NEW ARRIVALS", ctaPath: "/new-arrivals" as const, image: campaignTwo },
  { label: "THE MEN'S SALE EDIT", headline: "BETTER FITS. LESS SPEND.", product: "VEL0URA APPAREL menswear", text: "Save up to 30% on selected men's styles. Discover the pieces and see your savings before checkout.", cta: "SHOP THE DEALS", ctaPath: "/sale" as const, image: campaignOne },
];

export const storeConfig = { currency: "PKR", freeShippingThreshold: 15000, standardShipping: 250, expressShipping: 550, announcement: "NEW SEASON NOW LIVE · FREE DELIVERY OVER Rs. 15,000" };
export const coupons: Record<string, number> = { WELCOME10: 10, NEW20: 20, VELOURA15: 15 };
const mensImages: Record<string, string> = { Jackets: jacketImage, 'T-Shirts': teeImage, Shirts: shirtImage, Trousers: trouserImage, Hoodies: hoodieImage, Sneakers: sneakerImage, Accessories: campaignFour };
export const products: Product[] = catalog.map((product, index) => {
  const price = Math.round(product.price * 40 / 100) * 100 - 10;
  const image = product.tags.includes('cargo') ? cargoImage : product.tags.includes('overshirt') ? campaignThree : mensImages[product.category] ?? jacketImage;
  return { ...product, images: [image], mood: product.mood as Product["mood"], price, salePrice: index % 3 === 0 ? Math.round(price * (index % 2 === 0 ? .7 : .8) / 10) * 10 : undefined, rating: [4.8, 4.9, 4.7, 4.6][index % 4] ?? 4.8, reviewCount: 38 + index * 7, audience: "Men" };
});
export function productPrice(product: Product) { return product.salePrice ?? product.price; }
export function formatPrice(price: number) { return `Rs. ${Math.round(price).toLocaleString("en-PK")}`; }

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function recommendProducts(product: Product, limit = 4) {
  const ranked = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => product.tags.includes(tag)).length + (candidate.mood === product.mood ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.candidate.price - b.candidate.price)
    .map(({ candidate }) => candidate);
  return ranked.slice(0, limit);
}

export function productsForMood(mood: Product["mood"]) {
  return products.filter((product) => product.mood === mood).slice(0, 6);
}
