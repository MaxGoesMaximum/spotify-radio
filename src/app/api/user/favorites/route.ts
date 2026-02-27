import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { addFavoriteSchema, removeFavoriteSchema, paginationSchema } from "@/lib/validations";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-favs:${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const pagination = paginationSchema.safeParse({
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "50",
  });

  const page = pagination.success ? pagination.data.page : 1;
  const limit = pagination.success ? pagination.data.limit : 50;
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: auth.user.id },
      orderBy: { savedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.favorite.count({ where: { userId: auth.user.id } }),
  ]);

  return NextResponse.json({
    favorites,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-favs:${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = addFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_trackId: { userId: auth.user.id, trackId: parsed.data.trackId },
    },
    update: {},
    create: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-favs:${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = removeFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: auth.user.id, trackId: parsed.data.trackId },
  });

  return NextResponse.json({ success: true });
}
