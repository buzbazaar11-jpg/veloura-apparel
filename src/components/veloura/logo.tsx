import logo from '@/assets/veloura-logo-transparent.png';
export function Logo({ className = '' }: { className?: string }) {
  return <img src={logo} alt="VEL0URA APPAREL" width={829} height={706} className={`brand-logo ${className}`} />;
}
