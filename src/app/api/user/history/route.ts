import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { addHistorySchema, paginationSchema } from "@/lib/validations";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-history:${ip}`, 60);
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

  const [history, total] = await Promise.all([
    prisma.listeningHistory.findMany({
      where: { userId: auth.user.id },
      orderBy: { playedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.listeningHistory.count({ where: { userId: auth.user.id } }),
  ]);

  return NextResponse.json({
    history,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-history:${ip}`, 120);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = addHistorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.listeningHistory.create({
    data: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
