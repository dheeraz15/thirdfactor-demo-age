'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    // State is initialized lazily to avoid hydration mismatch if reading localStorage directly
    // but in useEffect we update it to match stored values.
    const [feedbackMode, setFeedbackMode] = useState<'roast' | 'flattery'>('flattery');
    const [apiVersion, setApiVersion] = useState<'v1' | 'v2'>('v1');
    const [gimmMode, setGimmMode] = useState<boolean>(true);
    const [strictMode, setStrictMode] = useState(false);
    const [celebMatch, setCelebMatch] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedFeedback = localStorage.getItem('feedbackMode');
        const storedApi = localStorage.getItem('apiVersion');
        const storedGimm = localStorage.getItem('gimmMode');
        const storedStrict = localStorage.getItem('strictOneFace');
        const storedCeleb = localStorage.getItem('celebMatch');

        if (storedFeedback === 'roast' || storedFeedback === 'flattery') setFeedbackMode(storedFeedback);
        if (storedApi === 'v1' || storedApi === 'v2') setApiVersion(storedApi);
        if (storedGimm !== null) setGimmMode(storedGimm === 'true');
        if (storedStrict === 'true') setStrictMode(true);
        if (storedCeleb !== null) setCelebMatch(storedCeleb === 'true');
    }, []);

    // Save changes to localStorage on effect
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('feedbackMode', feedbackMode);
    }, [feedbackMode, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('apiVersion', apiVersion);
    }, [apiVersion, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('gimmMode', String(gimmMode));
    }, [gimmMode, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('strictOneFace', String(strictMode));
    }, [strictMode, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('celebMatch', String(celebMatch));
    }, [celebMatch, mounted]);

    if (!mounted) return <div className="min-h-screen bg-white" />; // Prevent hydration mismatch flicker

    return (
        <div className="flex flex-col items-center min-h-screen p-6 bg-white text-black animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-8 pt-4">
                <Link
                    href="/demo"
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl font-bold">Settings</h1>
                <div className="w-10"></div>
            </div>

            <div className="w-full max-w-md space-y-6">
                {/* Settings Group */}
                <div className="flex flex-col space-y-4">

                    {/* API Version Toggle */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">API Version</span>
                            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                                <button
                                    onClick={() => setApiVersion('v1')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${apiVersion === 'v1' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    V1
                                </button>
                                <button
                                    onClick={() => setApiVersion('v2')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${apiVersion === 'v2' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    V2
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Select the endpoint version for face detection ({apiVersion === 'v1' ? 'Standard' : 'Experimental'}).
                        </p>
                    </div>

                    {/* Strict Mode (Preserved from existing file) */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Strict on 1 Face</span>
                            <button
                                onClick={() => setStrictMode(!strictMode)}
                                className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none ${strictMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${strictMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Only proceed if exactly one face is visible.
                        </p>
                    </div>

                    {/* Gimm Mode Toggle */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">GIMM Mode</span>
                            <button
                                onClick={() => setGimmMode(!gimmMode)}
                                className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none ${gimmMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${gimmMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Enable extended features like roast/flattery, emotion detection, and age feedback.
                        </p>

                        {/* Roast vs Flattery Toggle (Nested) */}
                        <div className={`transition-all duration-300 overflow-hidden ${gimmMode ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Feedback Type</span>
                                <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                    <span className={`text-xs font-bold transition-colors ${feedbackMode === 'flattery' ? 'text-gray-300' : 'text-red-500'}`}>Roast</span>
                                    <button
                                        onClick={() => setFeedbackMode(prev => prev === 'flattery' ? 'roast' : 'flattery')}
                                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${feedbackMode === 'flattery' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${feedbackMode === 'flattery' ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-xs font-bold transition-colors ${feedbackMode === 'flattery' ? 'text-emerald-600' : 'text-gray-300'}`}>Flattery</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Celebrity Match Toggle */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Celeb Match</span>
                            <button
                                onClick={() => setCelebMatch(!celebMatch)}
                                className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none ${celebMatch ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${celebMatch ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Enable celebrity look-alike matching feature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
