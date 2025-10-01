import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const REQUIRED_FIELDS = [
  "fullName",
  "username",
  "email",
  "country",
  "password",
  "confirmPassword",
  "acceptedTerms",
];

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

export async function POST(request) {
  try {
    const payload = await request.json();

    // 檢查必填欄位
    for (const field of REQUIRED_FIELDS) {
      if (payload[field] === undefined || payload[field] === null) {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 });
      }
    }

    const fullName = normalizeString(payload.fullName);
    const username = normalizeString(payload.username).toLowerCase();
    const email = normalizeString(payload.email).toLowerCase();
    const country = normalizeString(payload.country);
    const password = normalizeString(payload.password);
    const confirmPassword = normalizeString(payload.confirmPassword);
    const acceptedTerms = Boolean(payload.acceptedTerms);

    if (!fullName || !username || !email || !country) {
      return NextResponse.json({ message: "所有欄位皆需填寫" }, { status: 400 });
    }

    if (!/^[a-z0-9_-]{4,}$/i.test(username)) {
      return NextResponse.json({ message: "Username 至少 4 碼，僅能包含英數、底線、減號" }, { status: 400 });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ message: "請輸入有效的電子信箱" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "密碼至少需要 8 碼" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "兩次輸入的密碼不一致" }, { status: 400 });
    }

    if (!acceptedTerms) {
      return NextResponse.json({ message: "請先閱讀並同意條款" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Email 或 Username 已存在" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        username,
        country,
        passwordHash,
        acceptedTerms: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          country: user.country,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup", error);
    return NextResponse.json({ message: "建立帳戶時發生錯誤" }, { status: 500 });
  }
}
