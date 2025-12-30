'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

type Step = 'welcome' | 'prep' | 'capture' | 'result';

export default function DemoPage() {
    const [step, setStep] = useState<Step>('welcome');
    const [images, setImages] = useState<string[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('Initializing camera...');
    const [captureProgress, setCaptureProgress] = useState(0);
    const [ageData, setAgeData] = useState<{ age: number; gender: string } | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Logo component
    const Logo = () => (
        <div className="relative w-24 h-24 mb-6">
            <Image
                src="/thirdfactor-mark-transparent.png"
                alt="Third Factor Logo"
                fill
                className="object-contain"
            />
        </div>
    );

    // --- STEPS COMPONENTS ---

    const WelcomeStep = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white text-black">
            <Logo />
            <h2 className="text-xl font-medium text-gray-500 mb-2">Third Factor</h2>
            <h1 className="text-2xl font-bold mb-4">Verification for<br />Demo Applications</h1>
            <p className="text-gray-600 mb-12">
                Complete these steps to verify your identity
            </p>

            <div className="flex items-center space-x-4 mb-20 w-full max-w-xs p-4 rounded-xl bg-gray-50">
                <div className="h-10 w-2 rounded-full bg-blue-500/30">
                    <div className="h-1/2 w-full bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-left">
                    <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Step 1</p>
                    <p className="font-semibold">Age estimation</p>
                </div>
            </div>

            <button
                onClick={() => setStep('prep')}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
                Continue
            </button>

            <p className="mt-8 text-xs text-gray-400">
                By continuing, you acknowledge our <a href="#" className="underline">Privacy Notice</a>
            </p>
        </div>
    );

    const PrepStep = () => (
        <div className="flex flex-col items-center justify-between min-h-screen p-6 text-center animate-in fade-in slide-in-from-right-4 duration-500 bg-white text-black">
            <div className="w-full max-w-md pt-8">
                <div className="w-full h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-black w-1/3 rounded-full"></div>
                </div>

                <h1 className="text-2xl font-bold text-left mb-4">Prepare for the camera</h1>
                <p className="text-left text-gray-600 mb-8">
                    In a moment, we'll ask you to take a selfie by smiling, this will let us know it's really you
                </p>

                {/* Illustration */}
                <div className="relative w-full h-64 bg-yellow-50 rounded-3xl mb-8 flex items-center justify-center overflow-hidden">
                    {/* Simple CSS Phone Illustration */}
                    <div className="relative w-32 h-56 bg-white border-4 border-gray-800 rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-2">
                        <div className="w-16 h-4 bg-gray-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                        <div className="w-20 h-20 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
                            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-left text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                        <SunIcon className="w-6 h-6 text-gray-400" />
                        <span>Find an area with good lighting</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <EyeIcon className="w-6 h-6 text-gray-400" />
                        <span>Remove anything that covers your face</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <GlassesIcon className="w-6 h-6 text-gray-400" />
                        <span>No glasses to prevent glare or reflections</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setStep('capture')}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 mb-8"
            >
                Continue
            </button>
        </div>
    );


    const CaptureStep = () => {
        const [statusMessage, setStatusMessage] = useState("Initializing...");
        const [progress, setProgress] = useState(0);
        const [isReady, setIsReady] = useState(false);

        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // Refs for logic to avoid state dependency in loop
        const landmarkerRef = useRef<any>(null);
        const requestRef = useRef<number>(0);
        const processingRef = useRef(false);
        const lastTimeRef = useRef(-1);
        const progressRef = useRef(0);
        const mountedRef = useRef(true);

        useEffect(() => {
            mountedRef.current = true;
            let stream: MediaStream | null = null;

            const init = async () => {
                try {
                    // 1. Setup Camera
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'user',
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        }
                    });

                    if (!mountedRef.current) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Wait for metadata to ensure dimensions are known
                        await new Promise((resolve) => {
                            if (videoRef.current) {
                                videoRef.current.onloadedmetadata = resolve;
                            } else {
                                resolve(null);
                            }
                        });
                        videoRef.current.play().catch(console.error);
                    }

                    setStatusMessage("Loading AI Model...");

                    // 2. Setup MediaPipe
                    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
                    const vision = await FilesetResolver.forVisionTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                    );

                    if (!mountedRef.current) return;

                    const landmarker = await FaceLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                            delegate: "CPU"
                        },
                        runningMode: "VIDEO",
                        numFaces: 1,
                        outputFaceBlendshapes: true
                    });

                    if (!mountedRef.current) {
                        landmarker.close();
                        return;
                    }

                    landmarkerRef.current = landmarker;
                    setIsReady(true);
                    setStatusMessage("Align face in oval");
                    processingRef.current = true;
                    predictLoop();

                } catch (error) {
                    console.error("Initialization Error:", error);
                    if (mountedRef.current) {
                        setStatusMessage("Failed to initialize. Please reload.");
                    }
                }
            };

            init();

            return () => {
                mountedRef.current = false;
                processingRef.current = false;
                if (requestRef.current) cancelAnimationFrame(requestRef.current);

                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                if (landmarkerRef.current) {
                    try {
                        landmarkerRef.current.close();
                    } catch (e) {
                        // Ignore close errors
                    }
                }
            };
        }, []);

        const predictLoop = () => {
            if (!processingRef.current || !videoRef.current || !landmarkerRef.current) return;

            const video = videoRef.current;

            try {
                if (video.readyState >= 2 && !video.paused && video.videoWidth > 0 && video.videoHeight > 0) {
                    const now = performance.now();

                    // Only process if time has advanced
                    if (now > lastTimeRef.current) {
                        lastTimeRef.current = now;
                        const result = landmarkerRef.current.detectForVideo(video, now);
                        processResult(result, video.videoWidth);
                    }
                }
            } catch (e: any) {
                // MediaPipe sometimes throws/logs INFO messages as errors during first run
                const msg = e?.toString() || "";
                if (!msg.includes("INFO") && !msg.includes("delegate")) {
                    console.warn("Detection warning:", e);
                }
            }

            requestRef.current = requestAnimationFrame(predictLoop);
        };

        const processResult = (result: any, videoWidth: number) => {
            if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
                updateGuidance("No face detected", false);
                return;
            }

            const landmarks = result.faceLandmarks[0];

            // Logic for position
            // cheek_left: 234, cheek_right: 454
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            const nose = landmarks[1];

            const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
            const centerX = nose.x;

            // Ideal width is around 0.3 - 0.5 of screen width (depends on oval size)
            // Center should be roughly 0.5

            let msg = "";
            let good = true;

            if (faceWidth < 0.25) {
                msg = "Come closer";
                good = false;
            } else if (faceWidth > 0.6) {
                msg = "Move back";
                good = false;
            } else if (Math.abs(centerX - 0.5) > 0.1) {
                msg = "Center your face";
                good = false;
            } else {
                msg = "Perfect! Hold still...";
            }

            updateGuidance(msg, good);
        };

        const updateGuidance = (message: string, isGood: boolean) => {
            setStatusMessage(prev => prev !== message ? message : prev);

            if (isGood) {
                progressRef.current = Math.min(100, progressRef.current + 2); // 0 to 100 in ~50 frames (~1.5s)
            } else {
                progressRef.current = Math.max(0, progressRef.current - 5); // Decay faster
            }

            // Update UI ref manually or via state? setState is safer for re-render
            setProgress(progressRef.current);

            if (progressRef.current >= 100) {
                processingRef.current = false;
                captureSequence();
            }
        };

        const captureSequence = async () => {
            setStatusMessage("Processing...");
            const captures: string[] = [];

            // Take 3 shots
            for (let i = 0; i < 3; i++) {
                if (videoRef.current && canvasRef.current) {
                    const vid = videoRef.current;
                    const cvs = canvasRef.current;
                    cvs.width = vid.videoWidth;
                    cvs.height = vid.videoHeight;
                    const ctx = cvs.getContext('2d');
                    if (ctx) {
                        ctx.translate(cvs.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(vid, 0, 0);
                        captures.push(cvs.toDataURL("image/jpeg"));
                    }
                }
                await delay(300);
            }

            // Finish
            setImages(captures);
            setAgeData({
                age: Math.floor(Math.random() * (35 - 20) + 20),
                gender: Math.random() > 0.5 ? 'Male' : 'Female'
            });
            setStep('result');
        };

        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 text-white">
                    <button onClick={() => setStep('welcome')} className="text-blue-400 font-medium">Cancel</button>
                    {!isReady && <span className="text-xs text-gray-400">Loading AI...</span>}
                </div>

                <div className="relative w-full h-full">
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    />

                    {/* Dark Overlay with Oval Cutout */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <defs>
                                <mask id="mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    <ellipse cx="50%" cy="45%" rx="140" ry="200" fill="black" />
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#mask)" />

                            {/* Progress Ring */}
                            <ellipse
                                cx="50%" cy="45%" rx="140" ry="200"
                                fill="none"
                                stroke={progress > 0 ? "#3b82f6" : "rgba(255,255,255,0.2)"}
                                strokeWidth="4"
                                strokeDasharray={1000} // Approx perimeter is ~1100
                                strokeDashoffset={1000 * (1 - progress / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-100 linear"
                            />
                        </svg>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
                        <div className={`px-6 py-3 rounded-full backdrop-blur-md border shadow-lg transition-colors duration-300 ${progress > 0 ? "bg-green-500/20 border-green-500/50 text-white" : "bg-black/40 border-white/10 text-white"
                            }`}>
                            <span className="font-medium text-lg">{statusMessage}</span>
                        </div>
                    </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    };

    const ResultStep = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in zoom-in duration-500 bg-white text-black">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">Session Complete</h1>
            <p className="text-gray-500 mb-8">Data captured successfully</p>

            <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">Estimated Age</span>
                    <span className="text-xl font-bold">{ageData?.age}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="text-gray-500">Estimated Gender</span>
                    <span className="text-xl font-bold">{ageData?.gender}</span>
                </div>
            </div>

            {/* Debug Images */}
            {images.length > 0 && (
                <div className="flex gap-2 mb-8 overflow-x-auto max-w-full p-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <Image src={img} alt="capture" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => {
                    setImages([]);
                    setAgeData(null);
                    setStep('welcome');
                }}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
                Start Over
            </button>
        </div>
    );

    return (
        <main className="min-h-screen bg-white font-sans selection:bg-blue-100">
            {step === 'welcome' && <WelcomeStep />}
            {step === 'prep' && <PrepStep />}
            {step === 'capture' && <CaptureStep />}
            {step === 'result' && <ResultStep />}
        </main>
    );
}

// Icons
function SunIcon(props: any) {
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}
function EyeIcon(props: any) {
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
}
function GlassesIcon(props: any) {
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v4M8 8v4m-5.172 2.828a4 4 0 015.656 0l.516.516a.75.75 0 001.06 0l.516-.516a4 4 0 015.656 0L19.5 18a2 2 0 002 2h0a2 2 0 002-2v-2a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2h0a2 2 0 002-2v-1.172z" /></svg>
}

// Utils
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
