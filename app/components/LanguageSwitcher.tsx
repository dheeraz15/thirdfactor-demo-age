"use client";

import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === "en"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                English
            </button>
            <button
                onClick={() => setLanguage("ne")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === "ne"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                नेपाली
            </button>
        </div>
    );
}
