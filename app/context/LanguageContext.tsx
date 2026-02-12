"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ne";

type Translations = {
    // Home page
    title: string;
    description: string;
    generateSdk: string;
    footerRights: string;

    // Demo page - Welcome
    demoVerification: string;
    completeSteps: string;
    stepOne: string;
    ageEstimation: string;
    continue: string;
    privacyNotice: string;
    securedBy: string;

    // Demo page - Prep
    prepareCamera: string;
    positionFace: string;
    turnHead: string;
    imReady: string;

    // Demo page - Capture
    initializing: string;
    lookStraight: string;
    scanning: string;
    holdStill: string;
    comeCloser: string;
    moveBack: string;
    turnRight: string;
    turnLeft: string;
    verifying: string;

    // Demo page - Result
    sessionCompleted: string;
    celebLookAlike: string;
    noCelebMatch: string;
    estimatedAge: string;
    gender: string;
    unknown: string;
    startOver: string;
    match: string;
};

const translations: Record<Language, Translations> = {
    en: {
        // Home page
        title: "Third Factor Experience Center",
        description: "Experience the future of age verification. Seamlessly integrate our SDK into your application.",
        generateSdk: "Generate SDK",
        footerRights: "Third Factor. All rights reserved.",

        // Demo page - Welcome
        demoVerification: "Verify Identity",
        completeSteps: "Complete these steps to verify your identity",
        stepOne: "Step 1",
        ageEstimation: "Face Verification",
        continue: "Continue",
        privacyNotice: "Privacy Notice",
        securedBy: "Secured by",

        // Demo page - Prep
        prepareCamera: "Prepare for the camera",
        positionFace: "Position your face in the frame",
        turnHead: "Turn your head slowly to both sides",
        imReady: "I'm ready",

        // Demo page - Capture
        initializing: "Initializing...",
        lookStraight: "Look straight ahead",
        scanning: "Scanning...",
        holdStill: "Hold still...",
        comeCloser: "Come closer",
        moveBack: "Move back",
        turnRight: "Turn head Right →",
        turnLeft: "← Turn head Left",
        verifying: "Verifying...",

        // Demo page - Result
        sessionCompleted: "Session Completed",
        celebLookAlike: "Celebrity Look-alike",
        noCelebMatch: "No celebrity match found",
        estimatedAge: "Estimated Age",
        gender: "Gender",
        unknown: "Unknown",
        startOver: "Start Over",
        match: "match",
    },
    ne: {
        // Home page
        title: "थर्ड फ्याक्टर अनुभव केन्द्र",
        description: "उमेर प्रमाणीकरणको भविष्य अनुभव गर्नुहोस्। हाम्रो SDK लाई आफ्नो अनुप्रयोगमा सहजै एकीकृत गर्नुहोस्।",
        generateSdk: "SDK सिर्जना गर्नुहोस्",
        footerRights: "थर्ड फ्याक्टर। सबै अधिकार सुरक्षित।",

        // Demo page - Welcome
        demoVerification: "डेमो प्रमाणीकरण",
        completeSteps: "आफ्नो पहिचान प्रमाणित गर्न यी चरणहरू पूरा गर्नुहोस्",
        stepOne: "चरण १",
        ageEstimation: "उमेर अनुमान",
        continue: "जारी राख्नुहोस्",
        privacyNotice: "गोपनीयता सूचना",
        securedBy: "द्वारा सुरक्षित",

        // Demo page - Prep
        prepareCamera: "क्यामेराको लागि तयार हुनुहोस्",
        positionFace: "फ्रेममा आफ्नो अनुहार राख्नुहोस्",
        turnHead: "आफ्नो टाउको बिस्तारै दुवै तर्फ घुमाउनुहोस्",
        imReady: "म तयार छु",

        // Demo page - Capture
        initializing: "सुरु गर्दै...",
        lookStraight: "सीधा अगाडि हेर्नुहोस्",
        scanning: "स्क्यान गर्दै...",
        holdStill: "स्थिर रहनुहोस्...",
        comeCloser: "नजिक आउनुहोस्",
        moveBack: "पछाडि सर्नुहोस्",
        turnRight: "टाउको दायाँ घुमाउनुहोस् →",
        turnLeft: "← टाउको बायाँ घुमाउनुहोस्",
        verifying: "प्रमाणित गर्दै...",

        // Demo page - Result
        sessionCompleted: "पूरा भयो",
        celebLookAlike: "सेलिब्रिटी जस्तै देखिने",
        noCelebMatch: "कुनै सेलिब्रिटी मिलेन",
        estimatedAge: "अनुमानित उमेर",
        gender: "लिङ्ग",
        unknown: "अज्ञात",
        startOver: "फेरि सुरु गर्नुहोस्",
        match: "मिल्दो",
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

    // useEffect(() => {
    //     const fetchLocation = async () => {
    //         try {
    //             const response = await fetch("https://ipapi.co/json/");
    //             const data = await response.json();
    //             // if (data.country_code === "NP") {
    //             //     setLanguage("ne");
    //             // } else {
    //             //     setLanguage("en");
    //             // }
    //         } catch {
    //             // Silently fail if location cannot be fetched, default to English
    //         }
    //     };

    //     fetchLocation();
    // }, []);

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
