'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
    const router = useRouter();
    const [strictMode, setStrictMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('strictOneFace');
        if (stored === 'true') {
            setStrictMode(true);
        }
    }, []);

    const toggleStrict = () => {
        const newValue = !strictMode;
        setStrictMode(newValue);
        localStorage.setItem('strictOneFace', String(newValue));
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white text-black p-6 font-sans">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.push('/demo')}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold ml-4">Settings</h1>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900">Strict on 1 Face</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Only proceed if exactly one face is visible
                            </p>
                        </div>

                        <button
                            onClick={toggleStrict}
                            className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none ${strictMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-1 transition-transform duration-300 ${strictMode ? 'left-[calc(100%-28px)]' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex justify-center opacity-50">
                    <Image src="/thirdfactor-mark-transparent.png" alt="Logo" width={48} height={48} className="grayscale" />
                </div>
            </div>
        </div>
    );
}
