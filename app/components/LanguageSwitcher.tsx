"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const selectLanguage = (lang: "en" | "ne") => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="absolute top-4 right-4 z-50" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full border border-gray-200 transition-all text-sm font-medium text-gray-700"
            >
                {language === "en" ? <USFlag /> : <NepalFlag />}
                <span>{language === "en" ? "EN" : "NP"}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                    <button
                        onClick={() => selectLanguage("en")}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${language === "en" ? "bg-blue-50/50 text-blue-600" : "text-gray-700"
                            }`}
                    >
                        <USFlag />
                        <span>English</span>
                        {language === "en" && <CheckIcon />}
                    </button>
                    <button
                        onClick={() => selectLanguage("ne")}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${language === "ne" ? "bg-blue-50/50 text-blue-600" : "text-gray-700"
                            }`}
                    >
                        <div className="pl-0.5"><NepalFlag /></div>
                        <span>Nepali</span>
                        {language === "ne" && <CheckIcon />}
                    </button>
                </div>
            )}
        </div>
    );
}

function CheckIcon() {
    return (
        <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}

function USFlag() {
    return (
        <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-black/5">
            <Image src="/us.svg" alt="US Flag" width={20} height={20} className="w-full h-full object-cover" />
        </div>
    );
}

function NepalFlag() {
    return (
        <div className="w-4 h-5">
            <Image src="/np.svg" alt="Nepal Flag" width={16} height={20} className="w-full h-full object-contain" />
        </div>
    );
}
