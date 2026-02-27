import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/audit/log — Audit logging for security events
 * Logs user actions for GDPR compliance and security monitoring
 */

interface AuditEvent {
    action: string;
    details?: string;
    userId?: string;
    ip?: string;
}

// In-memory audit log (in production, use a proper database table or external service)
const auditLog: AuditEvent[] = [];
const MAX_LOG_SIZE = 10000;

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = rateLimit(`audit:${ip}`, 100);
    if (!rl.success) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: rateLimitHeaders(rl) });
    }

    try {
        const body = await request.json();
        const event: AuditEvent = {
            action: body.action || "unknown",
            details: body.details,
            userId: body.userId,
            ip,
        };

        auditLog.push(event);

        // Keep log bounded
        if (auditLog.length > MAX_LOG_SIZE) {
            auditLog.splice(0, auditLog.length - MAX_LOG_SIZE);
        }

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

    // Return last 100 events
    return NextResponse.json({
        events: auditLog.slice(-100),
        total: auditLog.length,
    });
}
