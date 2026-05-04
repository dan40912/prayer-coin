const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SAMPLE_OWNER = {
  email: "global.prayer.demo@startpray.local",
  name: "全球代禱示範",
  username: "global_prayer_demo",
};

const SAMPLE_CATEGORY = {
  slug: "global-prayer-demo",
  name: "全球城市代禱",
  description: "用於全球禱告室地圖呈現的城市測試資料。",
  sortOrder: 99,
};

const SAMPLE_CITIES = [
  {
    slug: "sample-global-prayer-taipei",
    city: "台北",
    country: "台灣",
    lat: 25.033,
    lng: 121.5654,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/family.jpg",
  },
  {
    slug: "sample-global-prayer-tokyo",
    city: "東京",
    country: "日本",
    lat: 35.6762,
    lng: 139.6503,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/personal.jpg",
  },
  {
    slug: "sample-global-prayer-london",
    city: "倫敦",
    country: "英國",
    lat: 51.5072,
    lng: -0.1276,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/gospel.jpg",
  },
  {
    slug: "sample-global-prayer-new-york",
    city: "紐約",
    country: "美國",
    lat: 40.7128,
    lng: -74.006,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/career.jpg",
  },
  {
    slug: "sample-global-prayer-sao-paulo",
    city: "聖保羅",
    country: "巴西",
    lat: -23.5558,
    lng: -46.6396,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/health.jpg",
  },
  {
    slug: "sample-global-prayer-cape-town",
    city: "開普敦",
    country: "南非",
    lat: -33.9249,
    lng: 18.4241,
    title: "為城市中的家庭重新得力代禱",
    image: "/img/categories/youth.jpg",
  },
];

function offsetDate(hoursAgo) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: SAMPLE_OWNER.email },
    update: {
      name: SAMPLE_OWNER.name,
      username: SAMPLE_OWNER.username,
      country: "台灣",
      isBlocked: false,
    },
    create: {
      email: SAMPLE_OWNER.email,
      name: SAMPLE_OWNER.name,
      username: SAMPLE_OWNER.username,
      country: "台灣",
      passwordHash: "demo-only-not-for-login",
      isBlocked: false,
      walletBalance: "0.00",
    },
  });

  const category = await prisma.homePrayerCategory.upsert({
    where: { slug: SAMPLE_CATEGORY.slug },
    update: {
      name: SAMPLE_CATEGORY.name,
      description: SAMPLE_CATEGORY.description,
      sortOrder: SAMPLE_CATEGORY.sortOrder,
      isActive: true,
    },
    create: {
      slug: SAMPLE_CATEGORY.slug,
      name: SAMPLE_CATEGORY.name,
      description: SAMPLE_CATEGORY.description,
      sortOrder: SAMPLE_CATEGORY.sortOrder,
      isActive: true,
    },
  });

  const created = [];

  for (let index = 0; index < SAMPLE_CITIES.length; index += 1) {
    const city = SAMPLE_CITIES[index];
    const createdAt = offsetDate(index * 4 + 1);
    const description = [
      `<p>這是一筆全球禱告室測試代禱，內容刻意保持相似，方便確認地球光點在不同城市平均分布。</p>`,
      `<p>請為${city.city}的家庭、工作壓力與人際修復代禱，也求神讓代禱者能快速看見這座城市正在被守望。</p>`,
    ].join("");

    const card = await prisma.homePrayerCard.upsert({
      where: { slug: city.slug },
      update: {
        title: city.title,
        image: city.image,
        alt: `${city.city} 城市代禱光點`,
        description,
        tags: ["全球禱告室", "城市代禱", "測試資料"],
        meta: [`城市：${city.city}`, `國家：${city.country}`, "用途：全球地球光點測試"],
        detailsHref: "/prayfor",
        voiceHref: "",
        locationCity: city.city,
        locationCountry: city.country,
        locationLat: city.lat,
        locationLng: city.lng,
        isPrivate: false,
        sortOrder: index + 1,
        categoryId: category.id,
        ownerId: owner.id,
        isBlocked: false,
        reportCount: 0,
        isSettled: false,
        settledAmount: null,
        createdAt,
      },
      create: {
        slug: city.slug,
        title: city.title,
        image: city.image,
        alt: `${city.city} 城市代禱光點`,
        description,
        tags: ["全球禱告室", "城市代禱", "測試資料"],
        meta: [`城市：${city.city}`, `國家：${city.country}`, "用途：全球地球光點測試"],
        detailsHref: "/prayfor",
        voiceHref: "",
        locationCity: city.city,
        locationCountry: city.country,
        locationLat: city.lat,
        locationLng: city.lng,
        isPrivate: false,
        sortOrder: index + 1,
        categoryId: category.id,
        ownerId: owner.id,
        isBlocked: false,
        reportCount: 0,
        isSettled: false,
        settledAmount: null,
        createdAt,
      },
    });

    const detailsHref = `/prayfor/${card.id}`;
    const updated = await prisma.homePrayerCard.update({
      where: { id: card.id },
      data: { detailsHref },
    });

    created.push({
      id: updated.id,
      slug: updated.slug,
      city: updated.locationCity,
      country: updated.locationCountry,
      lat: Number(updated.locationLat),
      lng: Number(updated.locationLng),
    });
  }

  console.log(JSON.stringify({ count: created.length, cards: created }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
