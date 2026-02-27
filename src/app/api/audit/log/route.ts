import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/audit/log — Audit logging for security events
 * Persists to database for GDPR compliance and security monitoring
 */

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`audit:${ip}`, 100);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    const body = await request.json();

    await prisma.auditLog.create({
      data: {
        action: body.action || "unknown",
        details: body.details || null,
        userId: body.userId || null,
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`audit-read:${ip}`, 10);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    const events = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const total = await prisma.auditLog.count();

    return NextResponse.json({ events, total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
