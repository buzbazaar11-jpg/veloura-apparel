import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Logo } from "@/components/veloura/logo";
import { Button } from "@/components/ui/button";
import { useVelouraStore } from "@/lib/veloura-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — VEL0URA APPAREL" },
      { name: "description", content: "Sign in or create a demo VEL0URA APPAREL account to track orders and save your wishlist." },
      { property: "og:title", content: "Account — VEL0URA APPAREL" },
      { property: "og:description", content: "Demo account for the VEL0URA APPAREL store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

type DemoUser = { name: string; email: string };

function readStoredUser(): DemoUser | null {
  try {
    return JSON.parse(window.localStorage.getItem("veloura-account") ?? "null");
  } catch {
    return null;
  }
}

function AccountPage() {
  const navigate = useNavigate();
  const { orders, wishlist } = useVelouraStore();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  useEffect(() => { setUser(readStoredUser()); }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const name = String(form.get("name") ?? "").trim() || (email.split("@")[0] ?? email);
    const password = String(form.get("password") ?? "");
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    const account: DemoUser = { name, email };
    window.localStorage.setItem("veloura-account", JSON.stringify(account));
    setUser(account);
    setError("");
  }

  function signOut() {
    window.localStorage.removeItem("veloura-account");
    setUser(null);
  }

  if (user) {
    return (
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-32 sm:px-8">
        <Logo className="size-24" />
        <h1 className="mt-5 font-display text-5xl">HELLO, {user.name.toUpperCase()}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Demo account — stored only in this browser, nothing is sent anywhere.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm bg-secondary p-5">
            <p className="text-xs font-semibold uppercase">Demo orders</p>
            <p className="mt-2 font-display text-4xl">{orders.length}</p>
            <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/track">Track an order</Link></Button>
          </div>
          <div className="rounded-sm bg-secondary p-5">
            <p className="text-xs font-semibold uppercase">Wishlist</p>
            <p className="mt-2 font-display text-4xl">{wishlist.length}</p>
            <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/wishlist">View wishlist</Link></Button>
          </div>
        </div>
        <Button variant="outline" className="mt-8" onClick={signOut}>Sign out</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-20 pt-32 sm:px-8">
      <Logo className="size-24" />
      <h1 className="mt-5 font-display text-5xl">{mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Demo sign-in. No password is stored or sent — this is a local sample.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-sm bg-secondary p-6">
        {mode === "register" ? (
          <label className="block">
            <span className="text-xs font-semibold uppercase">Name</span>
            <input name="name" className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm" />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs font-semibold uppercase">Email</span>
          <input name="email" type="email" required className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase">Password</span>
          <input name="password" type="password" required minLength={6} className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm" />
        </label>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" variant="editorial" className="w-full">{mode === "login" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="w-full text-center text-xs underline underline-offset-4">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
      <Button variant="ghost" className="mt-6 w-full" onClick={() => navigate({ to: "/shop" })}>Continue browsing</Button>
    </main>
  );
}
