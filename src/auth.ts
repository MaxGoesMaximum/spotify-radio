import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    spotifyId?: string;
    picture?: string;
  }
}

const config: NextAuthConfig = {
  providers: [
    Credentials({
      id: "spotify-tokens",
      name: "Spotify",
      credentials: {
        accessToken: { type: "text" },
        refreshToken: { type: "text" },
        expiresAt: { type: "text" },
        name: { type: "text" },
        email: { type: "text" },
        image: { type: "text" },
        spotifyId: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken) return null;
        return {
          id: (credentials.spotifyId as string) || "spotify-user",
          name: (credentials.name as string) || null,
          email: (credentials.email as string) || null,
          image: (credentials.image as string) || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger }) {
      // On initial sign in from our custom credentials
      if (trigger === "signIn" && account?.type === "credentials") {
        // The tokens are passed via the signIn call from our callback route
        const params = account as Record<string, unknown>;
        if (params.accessToken) {
          token.accessToken = params.accessToken as string;
          token.refreshToken = params.refreshToken as string;
          token.expiresAt = params.expiresAt as number;
        }
      }

      // Check if token needs refresh
      if (token.expiresAt && Date.now() >= (token.expiresAt as number) * 1000) {
        try {
          const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
              ).toString("base64")}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          const data = await response.json();
          if (!response.ok) throw data;

          token.accessToken = data.access_token;
          token.expiresAt = Math.floor(Date.now() / 1000 + data.expires_in);
          if (data.refresh_token) token.refreshToken = data.refresh_token;
        } catch {
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
