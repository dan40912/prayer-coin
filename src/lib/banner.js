import prisma from "@/lib/prisma";

const DEFAULT_BANNER = {
  eyebrow: "禱告即影響",
  headline: "讓每場祈禱聚會都連結真實改變",
  subheadline: "從禱告室到公益現場，即時紀錄每一次代禱與回應。",
  description:
    "Prayer Coin 為教會與公益團隊打造透明的禱告作業系統，協助你追蹤需求、動員資源並衡量影響。",
  primaryCta: { label: "立即註冊", href: "/signup" },
  secondaryCta: { label: "了解使用方式", href: "/howto" },
  heroImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1920&q=80"
};

function normalize(record) {
  if (!record) {
    return DEFAULT_BANNER;
  }

  return {
    eyebrow: record.eyebrow ?? DEFAULT_BANNER.eyebrow,
    headline: record.headline ?? DEFAULT_BANNER.headline,
    subheadline: record.subheadline ?? DEFAULT_BANNER.subheadline,
    description: record.description ?? DEFAULT_BANNER.description,
    primaryCta: {
      label: record.primaryCtaLabel ?? DEFAULT_BANNER.primaryCta.label,
      href: record.primaryCtaHref ?? DEFAULT_BANNER.primaryCta.href
    },
    secondaryCta:
      record.secondaryCtaLabel && record.secondaryCtaHref
        ? {
            label: record.secondaryCtaLabel,
            href: record.secondaryCtaHref
          }
        : DEFAULT_BANNER.secondaryCta,
    heroImage: record.heroImage ?? DEFAULT_BANNER.heroImage
  };
}

export async function readBanner() {
  const record = await prisma.siteBanner.findUnique({ where: { id: 1 } });
  return normalize(record);
}

export async function writeBanner(nextBanner) {
  const payload = {
    eyebrow: nextBanner.eyebrow ?? DEFAULT_BANNER.eyebrow,
    headline: nextBanner.headline ?? DEFAULT_BANNER.headline,
    subheadline: nextBanner.subheadline ?? DEFAULT_BANNER.subheadline,
    description: nextBanner.description ?? DEFAULT_BANNER.description,
    primaryCtaLabel: nextBanner.primaryCta?.label ?? DEFAULT_BANNER.primaryCta.label,
    primaryCtaHref: nextBanner.primaryCta?.href ?? DEFAULT_BANNER.primaryCta.href,
    secondaryCtaLabel: nextBanner.secondaryCta?.label ?? null,
    secondaryCtaHref: nextBanner.secondaryCta?.href ?? null,
    heroImage: nextBanner.heroImage ?? DEFAULT_BANNER.heroImage
  };

  const record = await prisma.siteBanner.upsert({
    where: { id: 1 },
    update: payload,
    create: { id: 1, ...payload }
  });

  return normalize(record);
}