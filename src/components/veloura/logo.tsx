import { useEffect, useState } from "react";
import { useSettings } from "@/lib/api";
import { assetUrl } from "@/lib/live-catalog";

interface LogoProps {
  className?: string;
  imageSrc?: string | null;
  text?: string;
  forceText?: boolean;
}

export function Logo({ className = '', imageSrc, text, forceText = false }: LogoProps) {
  const { data: settingsData } = useSettings();
  const [imageError, setImageError] = useState(false);
  const rawLogo = imageSrc ?? settingsData?.settings?.logo_url ?? null;
  useEffect(() => setImageError(false), [rawLogo]);
  
  // Dynamic image support: prop imageSrc or site settings logo_url
  const activeImage = !forceText && !imageError
    ? (imageSrc ?? (settingsData?.settings?.logo_url ? assetUrl(settingsData?.settings?.logo_url) : null))
    : null;
  const brandName = text ?? settingsData?.settings?.brand_name ?? 'VELOURA';

  const customWidth = undefined as number | undefined;
  const customHeight = settingsData?.settings?.logo_height;

  if (activeImage) {
    return (
      <img
        src={activeImage}
        alt={brandName}
        onError={() => setImageError(true)}
        style={customHeight ? { height: `${customHeight}px`, maxHeight: "none", width: "auto", maxWidth: "none" } : undefined}
        className={`brand-logo-img w-auto object-contain select-none transition-all duration-200 ${!customHeight ? 'h-11 sm:h-13 md:h-15 lg:h-16 max-h-[58px] max-w-[220px] sm:max-w-[260px]' : ''} ${className}`}
      />
    );
  }

  const fontSizeStyle = customHeight ? { fontSize: `${Math.round(customHeight * 0.62)}px` } : {};
  const widthStyle = customWidth ? { maxWidth: `${customWidth}px` } : {};

  return (
    <span
      className={`brand-wordmark font-display font-black tracking-[0.22em] ${!customHeight ? 'text-[26px] sm:text-3xl md:text-4xl lg:text-[36px]' : ''} uppercase select-none transition-all duration-200 inline-flex items-center justify-center text-center leading-none ${className}`}
      style={{
        letterSpacing: '0.22em',
        ...fontSizeStyle,
        ...widthStyle,
      }}
    >
      {brandName}
    </span>
  );
}
