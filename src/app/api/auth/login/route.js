// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// import prisma from "@/lib/prisma";

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json({ message: "請輸入電子信箱與密碼" }, { status: 400 });
//     }

//     const normalizedEmail = email.toLowerCase();
//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail }
//     });

//     if (!user || !user.passwordHash) {
//       return NextResponse.json({ message: "帳號或密碼錯誤" }, { status: 401 });
//     }

//     const isValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isValid) {
//       return NextResponse.json({ message: "帳號或密碼錯誤" }, { status: 401 });
//     }

//     return NextResponse.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         username: user.username,
//       }
//     });
//   } catch (error) {
//     console.error("POST /api/auth/login", error);
//     return NextResponse.json({ message: "登入時發生錯誤" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "請輸入電子信箱與密碼" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        passwordHash: true,
        isBlocked: true,   // ✅ 加上這個欄位
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "帳號或密碼錯誤" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "帳號或密碼錯誤" }, { status: 401 });
    }

    // ✅ 登入成功時，把 isBlocked 也回傳
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        isBlocked: user.isBlocked, // ✅ 加在這裡
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login", error);
    return NextResponse.json({ message: "登入時發生錯誤" }, { status: 500 });
  }
}
