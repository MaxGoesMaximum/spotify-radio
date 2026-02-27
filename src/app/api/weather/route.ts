import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { weatherQuerySchema } from "@/lib/validations";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const rl = rateLimit(`weather:${ip}`, 10);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { searchParams } = new URL(request.url);
  const parsed = weatherQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const { lat, lon } = parsed.data;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey || apiKey === "your_openweathermap_key_here") {
    return NextResponse.json({
      temp: 14, feels_like: 12, description: "broken clouds", icon: "04d",
      city: "Amsterdam", country: "NL", humidity: 72, wind_speed: 15,
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=nl`
    );

    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

    const data = await res.json();
    return NextResponse.json({
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0]?.description || "unknown",
      icon: data.weather[0]?.icon || "01d",
      city: data.name,
      country: data.sys?.country || "",
      humidity: data.main.humidity,
      wind_speed: data.wind?.speed ? data.wind.speed * 3.6 : 0,
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
