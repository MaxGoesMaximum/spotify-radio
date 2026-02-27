import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { updatePreferencesSchema } from "@/lib/validations";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const rl = rateLimit(`user-prefs:${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: auth.user.id },
  });

  return NextResponse.json({ preferences });
}

export async function PUT(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const rl = rateLimit(`user-prefs:${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: auth.user.id },
    update: parsed.data,
    create: { userId: auth.user.id, ...parsed.data },
  });

  return NextResponse.json({ preferences });
}
