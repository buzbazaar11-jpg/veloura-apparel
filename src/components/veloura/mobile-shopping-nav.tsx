import { Link, useRouterState } from '@tanstack/react-router';
import { Heart, Home, PackageCheck, ShoppingBag, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVelouraStore } from '@/lib/veloura-store';

export function MobileShoppingNav() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { wishlist, isCartOpen, isSearchOpen } = useVelouraStore();
  if (isCartOpen || isSearchOpen) return null;
  const items = [
    { label: 'Home', to: '/' as const, icon: Home },
    { label: 'Shop', to: '/shop' as const, icon: ShoppingBag },
    { label: 'Orders', to: '/track' as const, icon: PackageCheck },
    { label: 'Wishlist', to: '/wishlist' as const, icon: Heart },
    { label: 'Account', to: '/account' as const, icon: UserRound },
  ];
  return <nav aria-label="Mobile shopping navigation" className="mobile-shopping-nav">
    {items.map(({ label, to, icon: Icon }) => {
      const active = to === '/shop' ? ['/shop', '/product/', '/sale', '/new-arrivals', '/best-sellers', '/collections'].some(path => pathname.startsWith(path)) : to === '/track' ? pathname.startsWith('/track') || pathname.startsWith('/order/') : pathname === to;
      return <Button asChild variant="ghost" key={to} className={`mobile-nav-item ${active ? 'mobile-nav-active' : ''}`}><Link to={to} aria-current={active ? 'page' : undefined}><span className="relative"><Icon className="size-5" />{label === 'Wishlist' && wishlist.length > 0 ? <span className="mobile-nav-count">{wishlist.length}</span> : null}</span><span>{label}</span></Link></Button>;
    })}
  </nav>;
}