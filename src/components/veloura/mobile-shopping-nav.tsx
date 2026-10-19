import { Link, useRouterState } from '@tanstack/react-router';
import { Heart, Home, PackageCheck, ShoppingBag, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVelouraStore } from '@/lib/veloura-store';
import { SHOP_DEPARTMENTS } from '@/lib/product-audience';

export function MobileShoppingNav() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const department = useRouterState({ select: state => state.location.search['department'] });
  const { wishlist, isCartOpen, isSearchOpen } = useVelouraStore();
  if (isCartOpen || isSearchOpen) return null;
  const items = [
    ...SHOP_DEPARTMENTS.map(department => ({ label: department, to: '/shop' as const, search: { department }, icon: department === 'Mens' ? Home : ShoppingBag })),
    { label: 'Orders', to: '/track' as const, icon: PackageCheck },
    { label: 'Wishlist', to: '/wishlist' as const, icon: Heart },
    { label: 'Account', to: '/account' as const, icon: UserRound },
  ];
  return <nav aria-label="Mobile shopping navigation" className="mobile-shopping-nav">
    {items.map(item => {
      const { label, to, icon: Icon } = item;
      const active = to === '/shop' ? pathname === '/shop' && department === label : to === '/track' ? pathname.startsWith('/track') || pathname.startsWith('/order/') : pathname === to;
      return <Button asChild variant="ghost" key={label} className={`mobile-nav-item ${active ? 'mobile-nav-active' : ''}`}><Link to={to} search={'search' in item ? item.search : {}} aria-current={active ? 'page' : undefined}><span className="relative"><Icon className="size-5" />{label === 'Wishlist' && wishlist.length > 0 ? <span className="mobile-nav-count">{wishlist.length}</span> : null}</span><span>{label}</span></Link></Button>;
    })}
  </nav>;
}