import { NextResponse } from "next/server";

const DIRECTORY_SEGMENTS = new Set(["legacy", "css", "img", "js", "prayfor", "dontmove"]);

export function middleware(request) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (pathname === "/legacy" || pathname === "/legacy/") {
    const url = nextUrl.clone();
    url.pathname = "/legacy/index.html";
    return NextResponse.rewrite(url);
  }

  if (!pathname.startsWith("/legacy/")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (!lastSegment || lastSegment.includes(".")) {
    return NextResponse.next();
  }

  if (DIRECTORY_SEGMENTS.has(lastSegment)) {
    return NextResponse.next();
  }

  const url = nextUrl.clone();
  url.pathname = `${pathname}.html`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/legacy/:path*"],
};
