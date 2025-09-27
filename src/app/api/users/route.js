import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name } = body ?? {};

    if (!email) {
      return NextResponse.json({ message: "email is required" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    console.error("POST /api/users", error);
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  }
}