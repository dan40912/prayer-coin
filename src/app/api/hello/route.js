export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    message: "Start Pray API is reachable.",
    source: "Next.js app router",
    timestamp: new Date().toISOString()
  });
}
