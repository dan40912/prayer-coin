import { NextResponse } from "next/server";
import { readActiveCategories } from "@/lib/homeCategories";

export async function GET() {
  const categories = await readActiveCategories();
  return NextResponse.json(categories, { status: 200 });
}