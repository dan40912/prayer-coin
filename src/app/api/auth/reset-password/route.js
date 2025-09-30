import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "密碼至少需要 8 碼" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // 還沒過期
      },
    });

    if (!user) {
      return NextResponse.json({ message: "無效或過期的連結" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "密碼重設成功，請重新登入。" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/reset-password", err);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
