export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://startpray.online";
export const SITE_NAME = "Start Pray";
export const DEFAULT_OG_IMAGE = "/img/logo.png";
export const DEFAULT_DESCRIPTION =
  "Start Pray 是一個讓人分享代禱事項、用文字與語音彼此回應，並在全球禱告地圖上看見需要被守望的平台。";

export function absoluteUrl(path = "/") {
  try {
    return new URL(path, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

export function plainText(value = "", maxLength = 160) {
  const text = String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  keywords = [],
} = {}) {
  const resolvedTitle = title || SITE_NAME;
  const displayTitle = typeof resolvedTitle === "string" ? resolvedTitle : resolvedTitle?.default || SITE_NAME;
  const resolvedDescription = plainText(description || DEFAULT_DESCRIPTION, 160);
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "zh-Hant-TW": url,
      },
    },
    openGraph: {
      title: displayTitle,
      description: resolvedDescription,
      url,
      siteName: SITE_NAME,
      type,
      locale: "zh_TW",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: displayTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: resolvedDescription,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
