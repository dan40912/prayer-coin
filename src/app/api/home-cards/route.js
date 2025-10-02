// app/api/home-cards/route.js
import { NextResponse } from "next/server";
import { createHomeCard, readHomeCards } from "@/lib/homeCards";

function sanitizeCreatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (!body.title || typeof body.title !== "string") {
    throw new Error("Title is required");
  }

  if (!body.categoryId) {
    throw new Error("categoryId is required");
  }
    if (!body.ownerId) { 
    throw new Error("Owner ID is required");
  }

  return {
    title: body.title.trim(),
    slug: body.slug?.trim(),
    image: body.image?.trim(),
    alt: body.alt?.trim(),
    description: body.description?.trim(),
    tags: Array.isArray(body.tags) ? body.tags : [],
    meta: Array.isArray(body.meta) ? body.meta : [],
    detailsHref: body.detailsHref?.trim(),
    voiceHref: body.voiceHref?.trim(),
    categoryId: Number(body.categoryId),
    ownerId: body.ownerId, 
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const options = {};

  const sort = searchParams.get('sort');
  if (sort) {
    options.sort = sort;
  }

  const limit = searchParams.get('limit');
  if (limit) {
    options.limit = limit;
  }

  const skip = searchParams.get('skip');
  if (skip) {
    options.skip = Number(skip);
  }

  const categorySlug = searchParams.get('category');
  if (categorySlug && categorySlug !== 'popular' && categorySlug !== 'all') {
    options.categorySlug = categorySlug;
  }

  const categoryId = searchParams.get('categoryId');
  if (categoryId) {
    options.categoryId = categoryId;
  }

  const search = searchParams.get('search') || searchParams.get('q');
  if (search) {
    options.search = search;
  }

  if (!options.sort && categorySlug === 'popular') {
    options.sort = 'responses';
  }

  const cards = await readHomeCards(options);
  return NextResponse.json(cards, { status: 200 });
}

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const payload = sanitizeCreatePayload(body);
//     const created = await createHomeCard(payload);
//     return NextResponse.json(created, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: error.message || "Failed to create card" },
//       { status: 400 }
//     );
//   }
// }
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 💡 為了捕捉底層錯誤，暫時跳過 sanitizeCreatePayload
    //    我們直接使用 body 作為 payload
    const payload = body; 
    
    // 💥 讓錯誤在資料庫層拋出
    const created = await createHomeCard(payload); 
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // ⚠️ 關鍵步驟：將錯誤輸出到伺服器終端機
    console.error("--- PRISMA CREATE CARD ERROR ---");
    console.error(error);
    console.error("------------------------------");
    
    // 返回泛用 400 錯誤
    return NextResponse.json(
      { message: error.message || "Failed to create card, check server console for full error details." },
      { status: 400 }
    );
  }
}