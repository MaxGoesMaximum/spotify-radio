"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacyPage() {
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
                            Privacybeleid
                        </h1>
                        <p className="text-white/50 text-sm">Laatst bijgewerkt: Februari 2026</p>
                    </header>

                    <section className="space-y-6 text-white/70 font-light leading-relaxed">
                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4">
                            Gegevensverzameling
                        </h2>
                        <p>
                            Om deze applicatie (Spotify Radio) te laten werken, hebben wij tijdelijk toegang nodig tot bepaalde
                            gegevens van uw Spotify-account, mits u daar expliciet toestemming voor geeft via de Spotify Login stroom.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Uw profielinformatie (naam, avatar)</li>
                            <li>Uw Spotify Premium afspeelrechten (om nummers te pauzeren/skippen)</li>
                            <li>Uw luistergeschiedenis binnen de scope van de app</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4 mt-12">
                            Gegevensgebruik
                        </h2>
                        <p>
                            Alle gegevens worden uitsluitend gebruikt om de live-radio ervaring te verbeteren, inclusief
                            het genereren van AI DJ-scripts. <b>We delen, verkopen of misbruiken uw data nooit.</b>
                            De gegenereerde API tokens worden lokaal en beveiligd bewaard, en u kunt op elk moment uitloggen
                            om uw sessie onmiddellijk op te heffen.
                        </p>

                        <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-4 mt-12">
                            Contact
                        </h2>
                        <p>
                            Als u vragen heeft over dit privacybeleid, de gegevens die we bewaren, of verzoeken met betrekking
                            tot het verwijderen van accounts uit onze database, neem dan contact met ons op via de GitHub repository.
                        </p>
                    </section>
                </motion.div>
            </div>
        </main>
    );
}
