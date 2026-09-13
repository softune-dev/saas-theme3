import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import type { Business } from "@/lib/business-context";

// Same icon set as the dashboard's Contact Info → Social media section
// (dashboard/components/settings/site/contact/contact-data.ts) — one
// visual language for a platform across editor and storefront, instead of
// the hand-drawn SVG paths this used to duplicate.
const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  other: HiOutlineGlobeAlt,
};

export function SocialLinks({
  socials,
  className = "flex items-center gap-5",
  iconClassName = "size-5",
}: {
  socials: Business["socials"];
  className?: string;
  iconClassName?: string;
}) {
  const entries = socials
    ? Array.isArray(socials)
      ? []
      : Object.entries(socials).filter(([, url]) => url)
    : [];

  if (entries.length === 0) return null;

  return (
    <div className={className}>
      {entries.map(([platform, url]) => {
        const Icon = SOCIAL_ICONS[platform] ?? SOCIAL_ICONS.other;
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-[var(--foreground)] transition-colors"
            aria-label={platform}
          >
            <Icon className={iconClassName} aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
