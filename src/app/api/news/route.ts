import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { newsQuerySchema } from "@/lib/validations";

export const revalidate = 1800; // Cache for 30 minutes

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const rl = rateLimit(`news:${ip}`, 10);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { searchParams } = new URL(request.url);
  const parsed = newsQuerySchema.safeParse({ city: searchParams.get("city") || undefined });
  const city = parsed.success && parsed.data.city ? parsed.data.city : "Nederland";

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey || apiKey === "your_gnews_api_key_here") {
    return NextResponse.json({
      articles: [
        { title: "Nieuw fietspad geopend in het centrum", description: "De gemeente heeft vandaag een nieuw fietspad geopend dat het station verbindt met het winkelcentrum.", source: "Lokaal Nieuws", url: "#", publishedAt: new Date().toISOString() },
        { title: "Zonnepanelen project haalt doelstelling", description: "Het gemeentelijke zonnepanelen project heeft de jaarlijkse doelstelling ruimschoots gehaald.", source: "Duurzaam NL", url: "#", publishedAt: new Date().toISOString() },
        { title: "Lokaal restaurant wint prestigieuze prijs", description: "Restaurant De Gouden Lepel in het centrum heeft de prijs voor beste nieuwkomer gewonnen.", source: "Culinair Nieuws", url: "#", publishedAt: new Date().toISOString() },
        { title: "Nieuwe speeltuin geopend in het park", description: "Kinderen kunnen vanaf vandaag genieten van de splinternieuwe speeltuin in het stadspark.", source: "Stadsnieuws", url: "#", publishedAt: new Date().toISOString() },
      ],
    }, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  }

  try {
    const endpoint = city !== "Nederland"
      ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(city)}&lang=nl&country=nl&max=5&apikey=${apiKey}`
      : `https://gnews.io/api/v4/top-headlines?category=general&lang=nl&country=nl&max=5&apikey=${apiKey}`;
    const res = await fetch(endpoint);

    if (!res.ok) throw new Error(`News API error: ${res.status}`);

    const data = await res.json();
    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      source: a.source?.name || "Unknown",
      url: a.url,
      publishedAt: a.publishedAt,
    }));

    return NextResponse.json({ articles }, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
