import { toast } from "sonner";
import { api, apiEnabled, useSettings } from "./api";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCatalogVersion } from "@/lib/live-catalog";
import { getProductBySlug, products, productPrice, coupons, storeConfig, type Product } from "@/lib/veloura-data";

export type CartItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export type Order = {
  id: string;
  customer: { name: string; email: string; phone: string };
  address: { address: string; city: string; state: string; postalCode: string; country: string };
  discount: number;
  coupon: string | null;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  status: "CONFIRMED";
  backendOrderNumber?: string;
};

type MiniCartProduct = Pick<Product, "name" | "images"> & { size: string; color: string };

type VelouraStore = {
  coupon: string | null;
  discount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  deliveryMethod: string;
  setDeliveryMethod: (method: string) => void;
  recentlyViewed: string[];
  viewProduct: (id: string) => void;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  miniCart: MiniCartProduct | null;
  dismissMiniCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  addManyToCart: (items: { product: Product; size?: string; color?: string; quantity?: number }[]) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  removeWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  moveWishlistToCart: (product: Product) => void;
  createOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  findOrder: (id: string) => Order | undefined;
  cartSubtotal: number;
  shipping: number;
  standardShipping: number;
  freeShippingThreshold: number;
  cartTotal: number;
  cartCount: number;
};

const StoreContext = createContext<VelouraStore | null>(null);

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function VelouraProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [deliveryMethod, setDeliveryMethod] = useState("Standard");
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { data: settingsData } = useSettings();
  const liveStdShipping = Number(settingsData?.payment?.delivery_charge) || storeConfig.standardShipping;
  const liveFreeThreshold = Number(settingsData?.payment?.free_delivery_above) || storeConfig.freeShippingThreshold;
  const viewProduct = useCallback((id: string) => setRecentlyViewed(current => [id, ...current.filter(value => value !== id)].slice(0, 8)), []);
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    const normalized = code.trim().toUpperCase();
    if (apiEnabled) {
      try {
        const result = await api.validateCoupon(normalized, cartSubtotalRef.current);
        if (!result.ok) { toast.error(result.error ?? "Invalid or expired coupon."); return false; }
        setDiscountPercent(result.discount ?? coupons[normalized] ?? 0);
        setCoupon(normalized); toast.success("Coupon applied successfully"); return true;
      } catch {
        // Fall through to local validation on network error
      }
    }
    if (!coupons[normalized]) { toast.error("Invalid or expired coupon."); return false; }
    setDiscountPercent(coupons[normalized] ?? 0);
    setCoupon(normalized); toast.success("Coupon applied successfully"); return true;
  }, []);
  const removeCoupon = useCallback(() => { setCoupon(null); setDiscountPercent(0); toast("Coupon removed"); }, []);

  useEffect(() => {
    setCart(readLocal<CartItem[]>("veloura-cart", []));
    setWishlist(readLocal<string[]>("veloura-wishlist", []));
    setOrders(readLocal<Order[]>("veloura-orders", []));
    const savedCoupon = readLocal<string | null>("veloura-coupon", null);
    const validCoupon = savedCoupon && coupons[savedCoupon] ? savedCoupon : null;
    setCoupon(validCoupon);
    if (validCoupon) setDiscountPercent(coupons[validCoupon] ?? 0);
    setRecentlyViewed(readLocal<string[]>("veloura-recently-viewed", []));
    setHydrated(true);
  }, []);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [miniCart, setMiniCart] = useState<MiniCartProduct | null>(null);

  useEffect(() => {
    if (hydrated) writeLocal("veloura-cart", cart);
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) writeLocal("veloura-wishlist", wishlist);
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) writeLocal("veloura-orders", orders);
  }, [orders, hydrated]);

  useEffect(() => { if (hydrated) writeLocal("veloura-coupon", coupon); }, [coupon, hydrated]);
  useEffect(() => { if (hydrated) writeLocal("veloura-recently-viewed", recentlyViewed); }, [recentlyViewed, hydrated]);
  const addToCart = useCallback((product: Product, size?: string, color?: string, quantity = 1) => {
    if (product.stock <= 0) { toast.error("This piece is currently unavailable"); return; }
    const selectedSize = size ?? product.sizes[0] ?? "ONE SIZE";
    const selectedColor = color ?? product.colors[0] ?? "Ivory";
    setCart((current) => {
      const exists = current.find(
        (item) => item.productId === product.id && item.size === selectedSize && item.color === selectedColor,
      );
      if (exists) {
        return current.map((item) =>
          item.productId === product.id && item.size === selectedSize && item.color === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { productId: product.id, size: selectedSize, color: selectedColor, quantity }];
    });
    setMiniCart({ name: product.name, images: product.images, size: selectedSize, color: selectedColor });
    toast.success("Added to cart");
  }, []);

  const addManyToCart = useCallback(
    (items: { product: Product; size?: string; color?: string; quantity?: number }[]) => {
      items.forEach((item) => addToCart(item.product, item.size, item.color, item.quantity));
      if (items[0]) setCartOpen(true);
    },
    [addToCart],
  );

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
      return;
    }
    setCart((current) =>
      current.map((item) => (item.productId === productId && item.size === size && item.color === color ? { ...item, quantity } : item)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setCart((current) => current.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
    toast("Wishlist updated");
  }, []);

  const removeWishlist = useCallback((productId: string) => setWishlist((current) => current.filter((id) => id !== productId)), []);

  const dismissMiniCart = useCallback(() => setMiniCart(null), []);

  const moveWishlistToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      removeWishlist(product.id);
    },
    [addToCart, removeWishlist],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const createOrder = useCallback((orderInput: Omit<Order, "id" | "date" | "status">) => {
    const id = `VL-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    const order: Order = { ...orderInput, id, date: new Date().toISOString(), status: "CONFIRMED" };
    setOrders((current) => [order, ...current]);
    setCart([]);
    setCartOpen(false);
    setCoupon(null);
    setDiscountPercent(0);
    setMiniCart(null);
    if (apiEnabled) {
      api.createOrder(orderInput, id)
        .then(({ order: saved }) => {
          setOrders((current) => current.map((o) => (o.id === id ? { ...o, backendOrderNumber: saved.order_number } : o)));
          toast.success(`Order ${saved.order_number} received by our store`);
        })
        .catch((error: Error) => toast.error(`Store could not receive the order: ${error.message}`));
    } else {
      toast.success("Demo order confirmed — no payment taken");
    }
    return order;
  }, []);

  const findOrder = useCallback((id: string) => orders.find((order) => order.id.toUpperCase() === id.toUpperCase()), [orders]);

  const catalogV = useCatalogVersion();
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (productPrice(products.find((product) => product.id === item.productId) ?? products[0] as Product)) * item.quantity, 0),
    [cart, catalogV],
  );
  const cartSubtotalRef = useRef(cartSubtotal);
  cartSubtotalRef.current = cartSubtotal;
  const discount = coupon ? Math.round(cartSubtotal * (discountPercent || coupons[coupon] || 0) / 100) : 0;
  const shipping = cartSubtotal === 0 ? 0 : deliveryMethod === "Express" ? storeConfig.expressShipping : cartSubtotal >= liveFreeThreshold ? 0 : liveStdShipping;
  const cartTotal = cartSubtotal - discount + shipping;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<VelouraStore>(
    () => ({
      coupon, discount, applyCoupon, removeCoupon, deliveryMethod, setDeliveryMethod, recentlyViewed, viewProduct,
      cart,
      wishlist,
      orders,
      isCartOpen,
      isSearchOpen,
      miniCart,
      dismissMiniCart,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      addToCart,
      addManyToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      removeWishlist,
      isWishlisted: (productId: string) => wishlist.includes(productId),
      moveWishlistToCart,
      createOrder,
      findOrder,
      cartSubtotal,
      shipping,
      standardShipping: liveStdShipping,
      freeShippingThreshold: liveFreeThreshold,
      cartTotal,
      cartCount,
    }),
    [coupon, discount, applyCoupon, removeCoupon, deliveryMethod, recentlyViewed, viewProduct, cart, wishlist, orders, isCartOpen, isSearchOpen, miniCart, dismissMiniCart, addToCart, addManyToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, removeWishlist, moveWishlistToCart, createOrder, findOrder, cartSubtotal, shipping, liveStdShipping, liveFreeThreshold, cartTotal, cartCount],
  );

  useEffect(() => {
    if (!miniCart) return;
    const timeout = window.setTimeout(() => setMiniCart(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [miniCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useVelouraStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useVelouraStore must be used inside VelouraProvider");
  return store;
}

export function resolveCartItem(item: CartItem) {
  return getProductBySlug(products.find((product) => product.id === item.productId)?.slug ?? "");
}
