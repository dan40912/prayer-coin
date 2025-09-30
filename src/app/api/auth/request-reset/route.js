import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "請輸入電子信箱" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // 不要告訴攻擊者 email 是否存在，直接回成功
      return NextResponse.json({ message: "若該帳號存在，已寄送重設連結。" }, { status: 200 });
    }

    // 產生 token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 分鐘後過期

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    // 這裡應該要整合 email service (SendGrid / Nodemailer)
    console.log(`重設連結: https://6afddb2d6257.ngrok-free.app/reset-password?token=${resetToken}`);

    return NextResponse.json({ message: "若該帳號存在，已寄送重設連結。" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/request-reset", err);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
