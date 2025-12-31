"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ne";

type Translations = {
    title: string;
    description: string;
    generateSdk: string;
    footerRights: string;
};

const translations: Record<Language, Translations> = {
    en: {
        title: "Third Factor Experience Center",
        description: "Experience the future of age verification. Seamlessly integrate our SDK into your application.",
        generateSdk: "Generate SDK",
        footerRights: "Third Factor. All rights reserved.",
    },
    ne: {
        title: "थर्ड फ्याक्टर अनुभव केन्द्र",
        description: "उमेर प्रमाणीकरणको भविष्य अनुभव गर्नुहोस्। हाम्रो SDK लाई आफ्नो अनुप्रयोगमा सहजै एकीकृत गर्नुहोस्।",
        generateSdk: "SDK सिर्जना गर्नुहोस्",
        footerRights: "थर्ड फ्याक्टर। सबै अधिकार सुरक्षित।",
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch("https://ipapi.co/json/");
                const data = await response.json();
                if (data.country_code === "NP") {
                    setLanguage("ne");
                } else {
                    setLanguage("en");
                }
            } catch {
                // Silently fail if location cannot be fetched, default to English
            }
        };

        fetchLocation();
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
