const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SEED_MARKER = "<!-- seed:global-prayer-room -->";
const DEFAULT_COUNT = 15;
const MAX_COUNT = 50;
const IMAGE_PARAMS = "?auto=format&fit=crop&w=1200&q=80";
const DESCRIPTION_DB_LIMIT = 191;

const locations = [
  { city: "台北", country: "台灣", lat: 25.0330, lng: 121.5654 },
  { city: "新北", country: "台灣", lat: 25.0169, lng: 121.4628 },
  { city: "台中", country: "台灣", lat: 24.1477, lng: 120.6736 },
  { city: "台南", country: "台灣", lat: 22.9999, lng: 120.2270 },
  { city: "高雄", country: "台灣", lat: 22.6273, lng: 120.3014 },
  { city: "東京", country: "日本", lat: 35.6762, lng: 139.6503 },
  { city: "大阪", country: "日本", lat: 34.6937, lng: 135.5023 },
  { city: "首爾", country: "韓國", lat: 37.5665, lng: 126.9780 },
  { city: "倫敦", country: "英國", lat: 51.5072, lng: -0.1276 },
  { city: "紐約", country: "美國", lat: 40.7128, lng: -74.0060 },
  { city: "雪梨", country: "澳洲", lat: -33.8688, lng: 151.2093 },
  { city: "新加坡", country: "新加坡", lat: 1.3521, lng: 103.8198 },
];

const imagePool = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
];

const prayerTemplates = [
  {
    title: "為工作壓力與睡眠恢復代禱",
    body: "最近工作節奏一直很緊，回到家後腦袋還停不下來，睡眠也變得很淺。希望能重新找回安靜的心，不被待辦事項牽著走，也能有智慧分辨什麼需要立刻處理，什麼可以交託。請為我能恢復穩定作息與平安代禱。",
  },
  {
    title: "為家庭關係重新和好代禱",
    body: "家人之間最近因為一些小事累積了誤會，彼此說話都變得比較防備。我其實很想主動修復關係，卻不知道怎麼開口才不會讓情況更僵。請為我們都有柔軟的心代禱，也求神幫助我用合宜的方式表達關心。",
  },
  {
    title: "為新的工作方向尋求平安",
    body: "目前正在考慮是否轉換工作方向，心裡有期待，也有很多不確定。身邊的人給了不同建議，讓我更難判斷。請為我在做決定時不被焦慮推著走，而是能安靜整理自己的恩賜、責任與下一步，找到清楚又平安的方向。",
  },
  {
    title: "為身體檢查結果等候中的焦慮代禱",
    body: "最近做了一些例行檢查，還在等結果。雖然醫生沒有說太嚴重，但等待的過程還是讓我容易胡思亂想。請為我的心能穩定下來代禱，也求神幫助我照顧好每天能做的事，不讓未知的結果佔滿全部注意力。",
  },
  {
    title: "為孩子適應新環境代禱",
    body: "孩子最近進入新的學習環境，表面上看起來還好，但回家後常常變得沉默或容易累。我希望自己不要只是催促他適應，而能更細心聽懂他的需要。請為孩子有安全感、遇見合適的朋友，也為我們做父母的有耐心代禱。",
  },
  {
    title: "為照顧家人的疲憊代禱",
    body: "這段時間需要分擔比較多家裡的照顧責任，心裡知道這是愛的一部分，但有時也真的覺得疲憊。請為我有足夠的體力與情緒空間代禱，不在壓力裡變得苦毒，也能學會在需要時開口求助。",
  },
  {
    title: "為搬家與生活轉換代禱",
    body: "近期正在準備搬家，很多細節要安排，生活也有不少變動。雖然知道新的開始可能是好的，但過程中仍然有不安。請為搬遷順利、家人能適應新節奏代禱，也求神幫助我在變動中仍保有穩定的心。",
  },
  {
    title: "為失去動力的季節重新得力",
    body: "最近做很多事情都提不起勁，明明知道該前進，卻常常拖延或感到空轉。我不想只靠意志力硬撐，希望能重新找回內在的盼望和節奏。請為我在這段低潮中被扶持，也能一步一步恢復力量代禱。",
  },
  {
    title: "為人際關係中的誤解代禱",
    body: "最近和一位朋友之間有些誤會，彼此都沒有明說，但關係明顯變得疏遠。我在想是否該主動談談，又擔心對方覺得被打擾。請為我有謙卑與勇氣代禱，也求神讓我們能用真誠而不防衛的方式面對。",
  },
  {
    title: "為經濟壓力與日常開銷代禱",
    body: "這幾個月開銷增加，收入卻沒有太多變化，心裡常常為帳單和接下來的安排擔心。請為我有智慧管理手上的資源代禱，也求神幫助我不被恐懼控制，能看見可行的調整方式與被供應的恩典。",
  },
  {
    title: "為心裡的孤單與不安代禱",
    body: "最近即使身邊有人，心裡仍然常覺得孤單，好像很多感受不知道該跟誰說。請為我能遇見可以真實分享的人代禱，也求神在安靜時陪伴我，讓我知道自己不是一個人面對這些情緒。",
  },
  {
    title: "為重要決定有清楚方向代禱",
    body: "有一個重要決定需要在近期做出，目前看起來每個選項都有好處和代價。我不希望只是選最容易的路，而是能做出負責任也有平安的選擇。請為我有清楚判斷、合適的諮詢與安靜等候的心代禱。",
  },
  {
    title: "為團隊溝通與合作代禱",
    body: "最近團隊裡有些溝通不順，大家其實都很努力，卻容易因為壓力而誤解彼此。請為我們能重新建立信任代禱，也求神幫助我在其中不急著辯解，而是先聽懂對方真正的擔心。",
  },
  {
    title: "為長期疲累中的休息代禱",
    body: "過去一段時間一直處在忙碌狀態，身體和心都像沒有真正休息過。即使有空下來，也不太知道怎麼放鬆。請為我能學會健康地停下來代禱，也求神提醒我，價值不只來自做了多少事。",
  },
  {
    title: "為重新建立禱告生活代禱",
    body: "最近禱告變得很零散，有時只是匆忙說幾句就結束。我想重新建立穩定親近神的時間，不是出於壓力，而是因為真的需要被更新。請為我能從小小的開始重新出發代禱。",
  },
  {
    title: "為與同事之間的張力代禱",
    body: "工作上和一位同事互動有些緊張，很多時候我會先預設對方的意思，結果讓自己更不舒服。請為我有智慧面對職場關係代禱，也求神幫助我保持誠實、尊重與界線。",
  },
  {
    title: "為學習新技能的挫折代禱",
    body: "最近在學一項新的技能，進度比想像慢，常常懷疑自己是不是不適合。請為我能有耐心接受學習曲線代禱，不因比較而放棄，也能找到適合自己的方法慢慢累積。",
  },
  {
    title: "為婚姻中的溝通代禱",
    body: "最近和另一半談事情時，很容易因為語氣或疲憊而擦槍走火。其實我們都想好好溝通，只是常常在情緒裡失焦。請為我們能更溫柔地聽彼此，也願意在小事上先放下防衛代禱。",
  },
  {
    title: "為適應異地生活代禱",
    body: "來到新的城市後，生活節奏和人際圈都需要重新建立。有時白天忙起來還好，晚上就會特別想家。請為我能慢慢適應這裡的生活代禱，也求神預備合適的朋友和穩定的日常。",
  },
  {
    title: "為面對未來的不確定代禱",
    body: "最近想到未來就容易緊張，很多事情都還沒有答案。我知道擔心不能真的解決問題，但心還是常被拉走。請為我能把注意力放回今天能忠心做的事，也在不確定中學習信靠代禱。",
  },
];

function parseArgs(argv) {
  return argv.reduce((result, arg) => {
    const match = String(arg).match(/^--([^=]+)=(.*)$/);
    if (match) result[match[1]] = match[2];
    return result;
  }, {});
}

function clampCount(value) {
  const parsed = Number(value ?? DEFAULT_COUNT);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_COUNT;
  return Math.min(MAX_COUNT, Math.floor(parsed));
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function jitter(value) {
  return Number((value + (Math.random() * 0.16 - 0.08)).toFixed(6));
}

function randomDateWithinLast30Days() {
  const now = Date.now();
  const minAge = 60 * 60 * 1000;
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  return new Date(now - (minAge + Math.random() * (maxAge - minAge)));
}

function makeSlug(batchId, index) {
  return `seed-${batchId.slice(0, 8)}-${String(index + 1).padStart(2, "0")}-${crypto.randomBytes(3).toString("hex")}`;
}

function trimToLength(value, maxLength) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function makeDescription(body) {
  const wrapperLength = "<p></p>\n".length + SEED_MARKER.length;
  const safeBody = trimToLength(body, DESCRIPTION_DB_LIMIT - wrapperLength);
  return `<p>${safeBody}</p>\n${SEED_MARKER}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const expectedToken = process.env.SEED_PRAYER_TOKEN;
  const providedToken = args.token;
  const ownerId = process.env.SEED_PRAYER_USER_ID;
  const count = clampCount(args.count);

  if (!expectedToken) {
    throw new Error("Missing SEED_PRAYER_TOKEN environment variable.");
  }
  if (!providedToken || providedToken !== expectedToken) {
    throw new Error("Invalid or missing --token. Seed aborted.");
  }
  if (!ownerId) {
    throw new Error("Missing SEED_PRAYER_USER_ID environment variable. Seed aborted.");
  }

  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } });
  if (!owner) {
    throw new Error(`SEED_PRAYER_USER_ID does not match an existing user: ${ownerId}`);
  }

  const category = await prisma.homePrayerCategory.findFirst({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, name: true },
  });
  if (!category) {
    throw new Error("No active HomePrayerCategory found. Seed aborted.");
  }

  const seedBatchId = crypto.randomUUID();
  const templates = Array.from({ length: count }, (_, index) => prayerTemplates[index % prayerTemplates.length]);
  const shuffledTemplates = shuffle(templates);
  const usedTitles = new Set();
  const created = [];

  for (let index = 0; index < shuffledTemplates.length; index += 1) {
    const template = shuffledTemplates[index];
    const location = sample(locations);
    const createdAt = randomDateWithinLast30Days();
    const imageBase = sample(imagePool);
    const baseTitle = template.title;
    const title = usedTitles.has(baseTitle)
      ? `${baseTitle}（${location.city}守望 ${index + 1}）`
      : baseTitle;
    usedTitles.add(title);

    const card = await prisma.homePrayerCard.create({
      data: {
        slug: makeSlug(seedBatchId, index),
        image: `${imageBase}${IMAGE_PARAMS}`,
        alt: `${location.city} 的匿名代禱圖片`,
        title,
        description: makeDescription(template.body),
        tags: ["匿名代禱", "seed"],
        meta: {
          isSeed: true,
          seedBatchId,
          source: "scripts/seed-prayers.js",
        },
        detailsHref: "",
        voiceHref: null,
        locationCity: location.city,
        locationCountry: location.country,
        locationLat: jitter(location.lat),
        locationLng: jitter(location.lng),
        isPrivate: true,
        sortOrder: 0,
        categoryId: category.id,
        ownerId,
        createdAt,
        updatedAt: createdAt,
      },
      select: {
        id: true,
        locationCity: true,
        locationCountry: true,
      },
    });

    await prisma.homePrayerCard.update({
      where: { id: card.id },
      data: { detailsHref: `/prayfor/${card.id}`, updatedAt: createdAt },
    });

    created.push(card);
  }

  const locationSummary = created.reduce((summary, card) => {
    const key = `${card.locationCity}, ${card.locationCountry}`;
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});

  console.log("[seed:prayers] completed");
  console.log(JSON.stringify({
    seedBatchId,
    createdCount: created.length,
    createdPrayerIds: created.map((card) => card.id),
    categoryId: category.id,
    categoryName: category.name,
    locationSummary,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("[seed:prayers] failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
