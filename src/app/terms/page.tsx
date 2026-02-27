"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-32 px-6 sm:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <header className="mb-12">
                        <Link href="/about" className="inline-flex items-center gap-2 text-white/30 text-xs font-medium uppercase tracking-wider hover:text-white/60 transition-colors mb-6">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            Terug naar Over
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Algemene Voorwaarden
                        </h1>
                        <p className="text-white/50 text-sm">Laatst bijgewerkt: Februari 2026</p>
                    </header>

                    <section className="space-y-6 text-white/70 font-light leading-relaxed">
                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4">
                            Acceptatie van Voorwaarden
                        </h2>
                        <p>
                            Door toegang te krijgen tot en gebruik te maken van Spotify Radio, gaat u ermee akkoord te zijn
                            gebonden aan deze Algemene Voorwaarden. Deze service is een onofficiële open-source client gebouwd
                            bovenop de publieke Spotify API.
                        </p>

                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4 mt-12">
                            Abonnementsvereisten
                        </h2>
                        <p>
                            Voor het afspelen van volledige tracks via de Web Playback SDK is een actief **Spotify Premium**
                            abonnement te allen tijde vereist. Gebruikers zonder Premium-account bevinden zich in strijd
                            met deze vereisten en kunnen geen muziek streamen via dit platform.
                        </p>

                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4 mt-12">
                            Aansprakelijkheidsbeperking
                        </h2>
                        <p>
                            "Spotify" is een handelsmerk van Spotify AB. Deze applicatie levert de software "AS IS",
                            zonder enige expliciete of impliciete garanties. De makers van deze app zijn niet aansprakelijk
                            voor technische storingen aan de kant van Spotify of blokkades in de Web Playback SDK.
                        </p>

                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4 mt-12">
                            Disclaimer
                        </h2>
                        <p>
                            Deze diensten (zoals het AI DJ-systeem en weersvoorspellingen) worden aangeboden als experimenteel
                            concept. Wij garanderen geen 100% actieve uptime of ononderbroken foutvrije functionaliteit.
                        </p>
                    </section>
                </motion.div>
            </div>
        </main>
    );
}
