import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * DELETE /api/user/account — Account deletion
 * Permanently deletes all user data (GDPR right to erasure)
 */
export async function DELETE(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = rateLimit(`user-delete:${ip}`, 3);
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: rateLimitHeaders(rl) }
        );
    }

    const auth = await getAuthenticatedUser(request);
    if ("error" in auth) return auth.error;

    try {
        // Delete user and all related data (cascades via schema)
        await prisma.user.delete({
            where: { id: auth.user.id },
        });

        // Clear session cookie
        const response = NextResponse.json({
            message: "Account successfully deleted",
        });
        response.cookies.delete("spotify_session");
        return response;
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json(
            { error: "Deletion failed" },
            { status: 500 }
        );
    }
}
