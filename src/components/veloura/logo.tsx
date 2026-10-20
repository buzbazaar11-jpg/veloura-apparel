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

  // Text rendering with separate brand name and tagline, each with independent size
  const brandNameSize = settingsData?.settings?.brand_name_size;
  const taglineSize = settingsData?.settings?.brand_tagline_size;
  const brandTagline = settingsData?.settings?.brand_tagline ?? '';

  const nameStyle: React.CSSProperties = brandNameSize
    ? { fontSize: `${brandNameSize}px`, letterSpacing: '0.22em' }
    : { letterSpacing: '0.22em' };
  const taglineStyle: React.CSSProperties = taglineSize
    ? { fontSize: `${taglineSize}px`, letterSpacing: '0.15em' }
    : { letterSpacing: '0.15em' };

  return (
    <div className={`flex flex-col items-center justify-center leading-none ${className}`}>
      <span
        className={`brand-wordmark font-display font-black tracking-[0.22em] ${!brandNameSize ? 'text-[26px] sm:text-3xl md:text-4xl lg:text-[36px]' : ''} uppercase select-none transition-all duration-200`}
        style={nameStyle}
      >
        {brandName}
      </span>
      {brandTagline && (
        <span
          className={`brand-tagline font-display font-medium tracking-[0.15em] ${!taglineSize ? 'text-[10px] sm:text-xs' : ''} uppercase select-none transition-all duration-200 mt-0.5`}
          style={taglineStyle}
        >
          {brandTagline}
        </span>
      )}
    </div>
  );
}
