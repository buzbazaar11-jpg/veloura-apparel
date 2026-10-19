import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check, Mail, Phone, ShieldCheck, ArrowRight, RefreshCw, KeyRound,
  User as UserIcon, MapPin, Package, LogOut, Camera, Lock, Eye, EyeOff,
  ShoppingBag, ExternalLink, Clock, ChevronRight, Printer, X
} from "lucide-react";

import { Logo } from "@/components/veloura/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVelouraStore } from "@/lib/veloura-store";
import { api, authStorage, type UserProfile } from "@/lib/api";
import { formatPrice } from "@/lib/veloura-data";
import { assetUrl } from "@/lib/live-catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account & Profile — VEL0URA APPAREL" },
      { name: "description", content: "Manage your personal profile, view order history, upload profile picture, and track your VIP member benefits." },
      { property: "og:title", content: "My Account & Profile — VEL0URA APPAREL" },
      { property: "og:description", content: "Manage your personal profile and view order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

type Mode = "login" | "signup" | "otp";
type ActiveTab = "orders" | "profile" | "address" | "security";

function AccountPage() {
  const navigate = useNavigate();
  const { wishlist } = useVelouraStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize immediately from localStorage so there is ZERO delay / flickering
  const [user, setUser] = useState<UserProfile | null>(() => authStorage.getUser());
  const [profile, setProfile] = useState<{
    full_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    avatar_url?: string;
  } | null>(null);
  const [serverOrders, setServerOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Password change states
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // OTP Timer
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Address edit state
  const [addrForm, setAddrForm] = useState({
    city: "",
    address: "",
    postal_code: "",
    phone: "",
    full_name: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Load / refresh session on mount
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    api.auth.getProfile(token)
      .then((res) => {
        if (res.ok && res.user) {
          const u = {
            ...res.user,
            avatar_url: res.profile?.avatar_url || res.user.avatar_url || null
          };
          setUser(u);
          authStorage.setUser(u);
          setProfile(res.profile || null);
          setServerOrders(res.orders || []);
          setAddrForm({
            city: res.profile?.city || "",
            address: res.profile?.address || "",
            postal_code: res.profile?.postal_code || "",
            phone: res.user.phone || res.profile?.phone || "",
            full_name: res.profile?.full_name || res.user.full_name || "",
          });
        }
      })
      .catch((err) => {
        // If 401 Unauthorized, token actually expired
        if (err.message?.includes("401") || err.message?.includes("Not authenticated")) {
          authStorage.clear();
          setUser(null);
        }
      });
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (mode !== "otp" || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, countdown]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });
      if (res.requires_otp) {
        toast.info("Account unverified. A 6-digit code has been sent to your email.");
        setMode("otp");
        setCountdown(60);
        setCanResend(false);
        return;
      }

      if (res.ok && res.token && res.user) {
        authStorage.setToken(res.token);
        authStorage.setUser(res.user);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.full_name || res.user.email}!`);

        const profRes = await api.auth.getProfile(res.token);
        if (profRes.ok) {
          const u = {
            ...res.user,
            avatar_url: profRes.profile?.avatar_url || res.user.avatar_url || null
          };
          setUser(u);
          authStorage.setUser(u);
          setProfile(profRes.profile || null);
          setServerOrders(profRes.orders || []);
          setAddrForm({
            city: profRes.profile?.city || "",
            address: profRes.profile?.address || "",
            postal_code: profRes.profile?.postal_code || "",
            phone: res.user.phone || profRes.profile?.phone || "",
            full_name: profRes.profile?.full_name || res.user.full_name || "",
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.signup({
        email,
        password,
        full_name: fullName,
        phone,
      });

      if (res.requires_otp || res.ok) {
        toast.success(res.message || "Verification code sent to your email!");
        setMode("otp");
        setCountdown(60);
        setCanResend(false);
      }
    } catch (err: any) {
      setError(err.message || "Could not register account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.verifyOtp({ email, otp: otp.trim() });
      if (res.ok && res.token && res.user) {
        authStorage.setToken(res.token);
        authStorage.setUser(res.user);
        setUser(res.user);
        toast.success("Account successfully verified! You are now signed in.");

        const profRes = await api.auth.getProfile(res.token);
        if (profRes.ok) {
          setProfile(profRes.profile || null);
          setServerOrders(profRes.orders || []);
          setAddrForm({
            city: profRes.profile?.city || "",
            address: profRes.profile?.address || "",
            postal_code: profRes.profile?.postal_code || "",
            phone: res.user.phone || profRes.profile?.phone || "",
            full_name: profRes.profile?.full_name || "",
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!canResend) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.auth.resendOtp(email);
      toast.success(res.message || "A fresh verification code has been dispatched.");
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = authStorage.getToken();
    if (!token) return;

    setUploadingAvatar(true);
    try {
      const res = await api.auth.uploadAvatar(token, file);
      if (res.ok && res.avatar_url) {
        toast.success("Profile picture updated and saved to Cloudinary!");
        const updated = user ? { ...user, avatar_url: res.avatar_url } : null;
        if (updated) {
          setUser(updated);
          authStorage.setUser(updated);
        }
        setProfile((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : { avatar_url: res.avatar_url }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar image.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const token = authStorage.getToken();
    if (!token) return;

    setSavingProfile(true);
    try {
      const res = await api.auth.updateProfile(token, addrForm);
      if (res.ok) {
        toast.success("Profile information updated successfully!");
        setProfile(res.profile);
        const updatedUser: UserProfile = {
          ...user!,
          full_name: addrForm.full_name || user!.full_name,
          phone: addrForm.phone || user!.phone,
        };
        setUser(updatedUser);
        authStorage.setUser(updatedUser);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    const token = authStorage.getToken();
    if (!token) return;

    setPwLoading(true);
    try {
      const res = await api.auth.changePassword(token, {
        current_password: currentPw,
        new_password: newPw,
      });
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  }

  function signOut() {
    authStorage.clear();
    setUser(null);
    setProfile(null);
    setServerOrders([]);
    setMode("login");
    toast.info("Signed out of your account.");
  }

  // ── Authenticated User View (Advanced Customer Portal) ─────────────────────
  if (user) {
    const displayName = profile?.full_name || user.full_name || user.email.split("@")[0];
    const displayPhone = profile?.phone || user.phone;
    const avatarSrc = profile?.avatar_url || user.avatar_url;
    const initials = displayName
      .split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const cleanPhone = (displayPhone || "").replace(/[^0-9]/g, "");
    const waLink = cleanPhone
      ? cleanPhone.startsWith("92")
        ? cleanPhone
        : cleanPhone.startsWith("0")
        ? "92" + cleanPhone.slice(1)
        : cleanPhone
      : null;

    return (
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-32 sm:px-8">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar with Cloudinary upload trigger */}
              <div className="relative group shrink-0">
                <div className="size-20 sm:size-24 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center font-display text-2xl font-bold text-foreground shadow-sm">
                  {avatarSrc ? (
                    <img
                      src={assetUrl(avatarSrc)}
                      alt={displayName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {/* Upload button overlay */}
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile photo (Cloudinary)"
                  className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition"
                >
                  {uploadingAvatar ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Camera className="size-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700">
                    <Check className="size-3" /> OTP Verified
                  </span>
                  <span className="text-xs text-muted-foreground">VIP Member</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-bold text-foreground">
                  {displayName}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> {user.email}</span>
                  {displayPhone ? (
                    <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" /> {displayPhone}</span>
                  ) : (
                    <span className="text-amber-700">Add phone for WhatsApp updates</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2.5">
              {waLink && (
                <a
                  href={`https://wa.me/${waLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition"
                >
                  💬 WhatsApp Support
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" /> Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-border pb-px overflow-x-auto">
          {[
            { id: "orders", label: `My Orders (${serverOrders.length})`, icon: Package },
            { id: "profile", label: "Profile & Avatar", icon: UserIcon },
            { id: "address", label: "Shipping Address", icon: MapPin },
            { id: "security", label: "Security & Password", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition -mb-px ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: ORDERS & TRACKING ── */}
        {activeTab === "orders" && (
          <div className="mt-8">
            {serverOrders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-display text-2xl font-bold">No orders placed yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Orders placed while signed in with {user.email} will automatically appear here with live tracking.
                </p>
                <Button asChild size="sm" className="mt-5">
                  <Link to="/collections">Explore Men's Collection</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {serverOrders.map((ord: any) => {
                  const itemsCount = ord.items?.length || 1;
                  const firstItem = ord.items?.[0];
                  return (
                    <div
                      key={ord.id || ord.order_number}
                      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:border-foreground/30 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm sm:text-base">#{ord.order_number}</span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              ord.status === "delivered"
                                ? "bg-emerald-500/10 text-emerald-700"
                                : ord.status === "shipped"
                                ? "bg-blue-500/10 text-blue-700"
                                : ord.status === "cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Clock className="size-3" />
                            Placed on {ord.created_at ? new Date(ord.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Recent"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                          <div className="text-right mr-1">
                            <span className="block text-[11px] uppercase font-bold text-muted-foreground">Total</span>
                            <span className="font-extrabold text-lg text-foreground">
                              {formatPrice(ord.total || 0)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrder(ord)}
                            className="gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs"
                          >
                            <Eye className="size-3.5" /> View Order
                          </Button>
                          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Link to="/track">
                              Track <ChevronRight className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="mt-4 pt-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {ord.items && ord.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-secondary/50 rounded-xl p-2 pr-3 border border-border">
                              {it.image_url ? (
                                <img
                                  src={assetUrl(it.image_url)}
                                  alt={it.name || "Product"}
                                  className="size-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold">
                                  VA
                                </div>
                              )}
                              <div className="text-xs">
                                <span className="font-semibold block line-clamp-1">{it.name}</span>
                                <span className="text-muted-foreground">Qty: {it.quantity || 1} {it.size ? `· Size ${it.size}` : ""}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {ord.shipping_address && (
                          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="size-3 shrink-0" />
                            <span className="line-clamp-1">Deliver to: {ord.shipping_address}{ord.city ? `, ${ord.city}` : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PROFILE DETAILS & AVATAR ── */}
        {activeTab === "profile" && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-xl">
            <h2 className="font-display text-2xl font-bold">Personal Profile</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Update your account details and upload your custom profile photo (saved to Cloudinary).
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addrForm.full_name}
                  onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Phone Number (For WhatsApp order updates)
                </label>
                <input
                  type="tel"
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  placeholder="03001234567"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: SHIPPING ADDRESS ── */}
        {activeTab === "address" && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-xl">
            <h2 className="font-display text-2xl font-bold">Delivery Address</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Default shipping information prefilled during checkout for instant 1-click orders.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="Lahore, Karachi, Islamabad..."
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Street Address
                </label>
                <textarea
                  rows={3}
                  value={addrForm.address}
                  onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                  placeholder="House #, Street #, Sector / Area"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={addrForm.postal_code}
                  onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })}
                  placeholder="54000"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving Address..." : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 4: SECURITY & PASSWORD ── */}
        {activeTab === "security" && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-xl">
            <h2 className="font-display text-2xl font-bold">Security & Password</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Ensure your account is protected with a secure password.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  New Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-veloura"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={pwLoading}>
                  {pwLoading ? "Updating Password..." : "Change Password"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </main>
    );
  }

  // ── Unauthenticated Flow (Login / Signup / OTP) ───────────────────────────
  return (
    <main className="mx-auto max-w-md px-5 pb-24 pt-32 sm:px-8">
      <div className="text-center mb-8">
        <Link to="/" className="inline-block">
          <Logo className="mx-auto" />
        </Link>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-foreground">
          {mode === "login" && "WELCOME BACK"}
          {mode === "signup" && "CREATE ACCOUNT"}
          {mode === "otp" && "VERIFY EMAIL"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" && "Sign in with your email and password to access your orders."}
          {mode === "signup" && "Join VELOURA APPAREL. Receive 6-digit OTP to verify and activate your account."}
          {mode === "otp" && `Enter the 6-digit verification code sent to ${email}.`}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        {/* ── MODE: LOGIN ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-bold tracking-wide mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-semibold"
              >
                Don't have an account? Create one
              </button>
            </div>
          </form>
        )}

        {/* ── MODE: SIGNUP ── */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Ali"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Phone Number (WhatsApp Outreach)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address (Receives OTP)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Create Password (Min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-veloura"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-bold tracking-wide mt-2">
              {loading ? "Generating OTP..." : "Create Account & Send OTP"}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-semibold"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {/* ── MODE: OTP VERIFICATION ── */}
        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="rounded-xl bg-secondary/80 p-3.5 text-center text-xs text-muted-foreground">
              A 6-digit verification code has been dispatched to:
              <span className="block font-bold text-foreground mt-0.5">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] rounded-lg border-2 border-primary/20 bg-background px-4 py-3.5 focus-veloura"
                autoFocus
              />
            </div>

            <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-11 text-sm font-bold tracking-wide">
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                ← Change Email
              </button>

              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendOtp}
                className={`font-semibold ${canResend ? "text-primary hover:underline" : "text-muted-foreground cursor-not-allowed"}`}
              >
                {canResend ? "Resend Code" : `Resend in ${countdown}s`}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link to="/shop">← Return to Storefront</Link>
        </Button>
      </div>
    </main>
  );
}

function OrderDetailsModal({ order, onClose }: { order: any; onClose: () => void }) {
  if (!order) return null;

  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Recent";

  const statusColors: Record<string, string> = {
    delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    shipped: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    processing: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    confirmed: "bg-purple-500/15 text-purple-700 border-purple-500/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const statusClass = statusColors[order.status?.toLowerCase()] || "bg-primary/10 text-primary border-primary/20";

  const handlePrint = () => {
    window.print();
  };

  const supportMsg = encodeURIComponent(
    `Hello Veloura Support, I am inquiring about my Order #${order.order_number} (${formatPrice(order.total || 0)}). Please assist me with the status.`
  );

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogTitle className="sr-only">Order Details</DialogTitle>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight">
                #{order.order_number}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${statusClass}`}>
                {order.status || "Confirmed"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="size-3.5" /> Placed on {dateStr}
            </p>
          </div>
        </div>

        {/* Delivery & Customer Info Card */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/40 p-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Customer Details
            </span>
            <p className="font-semibold text-foreground text-sm">{order.customer_name || "Valued Customer"}</p>
            {order.customer_phone && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                <Phone className="size-3" /> {order.customer_phone}
              </p>
            )}
            {order.customer_email && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                <Mail className="size-3" /> {order.customer_email}
              </p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Delivery Destination
            </span>
            <p className="font-semibold text-foreground text-sm flex items-start gap-1">
              <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span>{order.shipping_address || "Standard Address"}{order.city ? `, ${order.city}` : ""}</span>
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              Payment: <strong className="text-foreground">Cash on Delivery (COD)</strong>
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Ordered Items ({order.items?.length || 1})
          </h4>
          <div className="divide-y divide-border border-y border-border">
            {order.items && order.items.map((item: any, idx: number) => {
              const itemTotal = (item.price || (order.total / (order.items.length || 1))) * (item.quantity || 1);
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={assetUrl(item.image_url)}
                        alt={item.name || "Item"}
                        className="size-14 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="size-14 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
                        VA
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name || "Veloura Menswear Item"}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        {item.color && <span>• Color: <strong>{item.color}</strong></span>}
                        <span>• Qty: <strong>{item.quantity || 1}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.total || 0)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping & Handling</span>
            <span className="text-sage font-semibold">Complimentary Delivery</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
            <span>Grand Total (COD)</span>
            <span className="text-base text-foreground font-extrabold">{formatPrice(order.total || 0)}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs print:hidden"
            >
              <Printer className="size-3.5" /> Print Receipt
            </Button>
            <a
              href={`https://wa.me/923000000000?text=${supportMsg}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              💬 WhatsApp Support
            </a>
          </div>

          <Button asChild size="sm" className="gap-1 text-xs">
            <Link to="/track">
              Track Order Status <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

