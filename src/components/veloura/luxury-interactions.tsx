import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import type { Product } from "@/lib/veloura-data";

/**
 * Magnetic button wrapper: creates subtle physics-based glide towards the cursor.
 */
export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--magnet-x", "0px");
    ref.current.style.setProperty("--magnet-y", "0px");
  };

  return (
    <div
      ref={ref}
      className={`luxury-magnetic ${className}`}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.12;
        event.currentTarget.style.setProperty("--magnet-x", `${Math.max(-5, Math.min(5, offsetX))}px`);
        event.currentTarget.style.setProperty("--magnet-y", `${Math.max(-5, Math.min(5, offsetY))}px`);
      }}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </div>
  );
}

/**
 * EditorialImage: fabric weave inspection loupe for luxury apparel.
 */
export function EditorialImage({
  src,
  alt = "Product fabric inspection",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [lens, setLens] = useState(false);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    event.currentTarget.style.setProperty("--lens-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--lens-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--lens-bg-x", `${70 - x * rect.width * 2.5}px`);
    event.currentTarget.style.setProperty("--lens-bg-y", `${70 - y * rect.height * 2.5}px`);
    event.currentTarget.style.setProperty("--lens-bg-width", `${rect.width * 2.5}px`);
    event.currentTarget.style.setProperty("--lens-bg-height", `${rect.height * 2.5}px`);
    setLens(true);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setLens(false)}
      className={`editorial-image relative overflow-hidden select-none cursor-crosshair ${className}`}
    >
      <img src={src} alt={alt} width={1200} height={1500} className="h-full w-full object-cover" />
      <span className={`fabric-lens ${lens ? "is-active" : ""}`} aria-hidden="true">
        <img src={src} alt="" />
      </span>
      <div className="absolute bottom-3 left-3 pointer-events-none rounded-full bg-background/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity border border-border shadow-xs">
        🔍 Hover to inspect fabric & weave
      </div>
    </div>
  );
}