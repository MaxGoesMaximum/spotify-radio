import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ServiceWorkerRegister } from "@/components/providers/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Spotify Radio - Je Eigen Radiozender",
  description:
    "Luister naar je favoriete muziek met een echte radio-ervaring, compleet met DJ, weer en nieuws.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spotify Radio",
  },
  openGraph: {
    title: "Spotify Radio",
    description: "Je eigen intelligente radiozender met Spotify, DJ, weer en nieuws.",
    type: "website",
    siteName: "Spotify Radio",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A84FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { NavigationBar } from "@/components/ui/NavigationBar";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { KeyboardShortcutsOverlay } from "@/components/ui/KeyboardShortcutsOverlay";
import { WebVitals } from "@/components/providers/WebVitals";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="min-h-[100dvh] bg-radio-bg font-display antialiased overflow-x-hidden selection:bg-white/20 selection:text-white">
        <Providers>
          <WebVitals />
          <ServiceWorkerRegister />
          {/* Skip to main content — accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black focus:text-sm focus:font-medium focus:shadow-lg"
          >
            Skip to content
          </a>
          <main id="main-content">
            {children}
          </main>
          <NavigationBar />
          <ToastContainer />
          <CookieConsent />
          <KeyboardShortcutsOverlay />
        </Providers>
      </body>
    </html>
  );
}
