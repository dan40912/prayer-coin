import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import {
  createCustomerSessionToken,
  setCustomerSessionCookie,
} from "@/lib/customer-session";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "請輸入電子郵件與密碼" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        sessionVersion: true,
        publicProfileEnabled: true,
        passwordHash: true,
        isBlocked: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "帳號或密碼不正確" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "帳號或密碼不正確" }, { status: 401 });
    }
    if (user.isBlocked) {
      return NextResponse.json({ message: "帳號已被停用" }, { status: 403 });
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        isBlocked: user.isBlocked,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        publicProfileEnabled: user.publicProfileEnabled,
      },
    });

    const sessionToken = createCustomerSessionToken(user);
    setCustomerSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error("POST /api/auth/login 發生錯誤", error);
    return NextResponse.json({ message: "登入時發生錯誤" }, { status: 500 });
  }
}
