import prisma from "./prisma";
import { buildOvercomerSlug } from "./overcomer";

const RESPONSES_TAKE = 20;
const CARDS_TAKE = 12;

const OVERCOMER_SELECT = {
  id: true,
  email: true,
  name: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  homePrayerCards: {
    where: { isBlocked: false },
    orderBy: { createdAt: "desc" },
    take: CARDS_TAKE,
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      alt: true,
      detailsHref: true,
      updatedAt: true,
      _count: { select: { responses: true } },
    },
  },
  prayerResponses: {
    where: { isBlocked: false, homeCardId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: RESPONSES_TAKE,
    select: {
      id: true,
      message: true,
      voiceUrl: true,
      reportCount: true,
      createdAt: true,
      homeCard: {
        select: {
          id: true,
          title: true,
          image: true,
          alt: true,
          detailsHref: true,
          slug: true,
        },
      },
    },
  },
};

export async function readOvercomerProfile(username) {
  const raw = username?.trim();
  console.log("[overcomer] readOvercomerProfile input", raw);
  if (!raw) return null;

  const normalized = raw.toLowerCase();

  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: {
        username: { equals: normalized, mode: "insensitive" },
      },
      select: OVERCOMER_SELECT,
    });
  } catch (error) {
    console.warn("[overcomer] findFirst failed, fallback to findUnique", error);
    user = await prisma.user.findUnique({
      where: { username: normalized },
      select: OVERCOMER_SELECT,
    });
  }

  if (!user) {
    console.log("[overcomer] readOvercomerProfile result", null);
    return null;
  }

  const enriched = {
    ...user,
    slug: buildOvercomerSlug(user),
    homePrayerCards: user.homePrayerCards ?? [],
    prayerResponses: user.prayerResponses ?? [],
  };
  console.log("[overcomer] readOvercomerProfile result", {
    id: enriched.id,
    username: enriched.username,
    slug: enriched.slug,
    cards: enriched.homePrayerCards.length,
    responses: enriched.prayerResponses.length,
  });
  return enriched;
}

export function buildOvercomerCardPath(card) {
  if (!card?.id) return null;
  return `/prayfor/${card.id}`;
}

export function buildOvercomerResponsePath(response) {
  const card = response?.homeCard;
  if (!card?.id) return null;
  return `/prayfor/${card.id}`;
}
