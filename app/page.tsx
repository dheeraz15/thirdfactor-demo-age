"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 p-8 font-sans">
      <main className="flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/thirdfactor-mark-transparent.png"
            alt="Third Factor Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {t.title}
        </h1>

        <p className="text-lg text-gray-600 max-w-lg">
          {t.description}
        </p>

        <Link
          href="/demo"
          target="_blank"
          className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg shadow-blue-500/30"
        >
          {t.generateSdk}
          <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
        </Link>
      </main>

      <footer className="absolute bottom-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {t.footerRights}
      </footer>
    </div>
  );
}
