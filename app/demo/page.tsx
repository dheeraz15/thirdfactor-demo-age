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
        const [stage, setStage] = useState<'align' | 'right' | 'left' | 'complete'>('align');
        const [isReady, setIsReady] = useState(false);
        const [stepImages, setStepImages] = useState<string[]>([]);

        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // Logic refs
        const landmarkerRef = useRef<any>(null);
        const requestRef = useRef<number>(0);
        const processingRef = useRef(false);
        const lastTimeRef = useRef(-1);
        const stageProgressRef = useRef(0);
        const mountedRef = useRef(true);
        const internalStageRef = useRef<'align' | 'right' | 'left' | 'complete'>('align');

        useEffect(() => {
            mountedRef.current = true;
            let stream: MediaStream | null = null;

            const init = async () => {
                try {
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
                        await new Promise((resolve) => {
                            if (videoRef.current) {
                                videoRef.current.onloadedmetadata = resolve;
                            } else {
                                resolve(null);
                            }
                        });
                        videoRef.current.play().catch(console.error);
                    }

                    setStatusMessage("Loading AI...");

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
                        numFaces: 1
                    });

                    if (!mountedRef.current) {
                        landmarker.close();
                        return;
                    }

                    landmarkerRef.current = landmarker;
                    setIsReady(true);
                    setStatusMessage("Please, look straight into the camera");
                    processingRef.current = true;
                    predictLoop();

                } catch (error) {
                    console.error("Init Error", error);
                    setStatusMessage("Camera Error");
                }
            };

            init();

            return () => {
                mountedRef.current = false;
                processingRef.current = false;
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                if (stream) stream.getTracks().forEach(track => track.stop());
                if (landmarkerRef.current) {
                    try { landmarkerRef.current.close(); } catch (e) { }
                }
            };
        }, []);

        const predictLoop = () => {
            if (!processingRef.current || !videoRef.current || !landmarkerRef.current) return;
            const video = videoRef.current;
            try {
                if (video.readyState >= 2 && !video.paused && video.videoWidth > 0 && video.videoHeight > 0) {
                    const now = performance.now();
                    if (now > lastTimeRef.current) {
                        lastTimeRef.current = now;
                        const result = landmarkerRef.current.detectForVideo(video, now);
                        processResult(result);
                    }
                }
            } catch (e: any) { }
            requestRef.current = requestAnimationFrame(predictLoop);
        };

        const processResult = (result: any) => {
            if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
                return;
            }
            const landmarks = result.faceLandmarks[0];
            const nose = landmarks[1];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
            const centerX = (leftCheek.x + rightCheek.x) / 2;
            const yaw = (nose.x - centerX) / faceWidth;
            handleStageLogic(faceWidth, nose.x, yaw);
        };

        const handleStageLogic = (faceWidth: number, noseX: number, yaw: number) => {
            const currentStage = internalStageRef.current;
            let good = false;
            let msg = "";

            if (currentStage === 'align') {
                const isCentered = Math.abs(noseX - 0.5) < 0.1 && faceWidth > 0.25 && faceWidth < 0.6;
                if (isCentered) {
                    msg = "Please, look straight into the camera";
                    good = true;
                } else {
                    if (faceWidth < 0.25) msg = "Come closer";
                    else if (faceWidth > 0.6) msg = "Move back";
                    else msg = "Center your face";
                }
            } else if (currentStage === 'right') {
                msg = "Turn your head slowly to the right";
                if (yaw < -0.15) {
                    good = true;
                    msg = "Perfect, hold still";
                }
            } else if (currentStage === 'left') {
                if (yaw > 0.15) {
                    good = true;
                    msg = "Perfect, hold still";
                } else {
                    msg = "Turn your head slowly to the left";
                }
            }

            setStatusMessage(prev => prev !== msg ? msg : prev);

            if (good) {
                stageProgressRef.current = Math.min(100, stageProgressRef.current + 2);
            } else {
                stageProgressRef.current = Math.max(0, stageProgressRef.current - 5);
            }

            let totalProgress = 0;
            if (currentStage === 'align') totalProgress = stageProgressRef.current * 0.33;
            if (currentStage === 'right') totalProgress = 33 + (stageProgressRef.current * 0.33);
            if (currentStage === 'left') totalProgress = 66 + (stageProgressRef.current * 0.34);

            setProgress(totalProgress);

            if (stageProgressRef.current >= 100) {
                stageProgressRef.current = 0;
                if (currentStage === 'align') {
                    setStage('right');
                    internalStageRef.current = 'right';
                } else if (currentStage === 'right') {
                    setStage('left');
                    internalStageRef.current = 'left';
                } else if (currentStage === 'left') {
                    setStage('complete');
                    internalStageRef.current = 'complete';
                    captureSequence();
                }
            }
        };

        const captureSequence = async () => {
            processingRef.current = false;
            setStatusMessage("Processing...");
            const captures: string[] = [];
            for (let i = 0; i < 3; i++) {
                if (videoRef.current && canvasRef.current) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(video, 0, 0);
                        captures.push(canvas.toDataURL("image/jpeg"));
                    }
                }
                await delay(150);
            }
            setImages(captures);
            setAgeData({
                age: Math.floor(Math.random() * (35 - 20) + 20),
                gender: Math.random() > 0.5 ? 'Male' : 'Female'
            });
            setStep('result');
        };

        const totalDashes = 60;

        return (
            <div className="flex flex-col min-h-screen bg-white text-black relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                    <button onClick={() => setStep('welcome')}>
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-400 font-medium">
                        <span className="text-sm">Powered by</span>
                        <span className="text-gray-600 font-bold">Third Factor</span>
                    </div>
                    <button className="text-blue-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center relative">

                    {/* Camera Circle Container */}
                    <div className="relative w-80 h-80 flex items-center justify-center mb-12">

                        <div className="absolute inset-0 w-full h-full">
                            {/* SVG Ring with Ticks */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                                {Array.from({ length: totalDashes }).map((_, i) => {
                                    // Center 160, 160. Radius 140.
                                    const angle = (i / totalDashes) * 2 * Math.PI - Math.PI / 2; // Start top
                                    const x1 = 160 + 130 * Math.cos(angle);
                                    const y1 = 160 + 130 * Math.sin(angle);
                                    const x2 = 160 + 150 * Math.cos(angle); // Length 20
                                    const y2 = 160 + 150 * Math.sin(angle);

                                    const isActive = (i / totalDashes) * 100 < progress;

                                    return (
                                        <line
                                            key={i}
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke={isActive ? (stage === 'complete' ? '#10b981' : '#0ea5e9') : '#e5e7eb'}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            className="transition-colors duration-150"
                                        />
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Video Circle */}
                        <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-inner relative z-10 bg-gray-100">
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        </div>
                    </div>

                    {/* Instruction Text */}
                    <div className="text-center px-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
                            {statusMessage}
                        </h2>
                    </div>

                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    };

    const ResultStep = () => {
        const [Lottie, setLottie] = useState<any>(null);

        useEffect(() => {
            import('lottie-react').then(mod => setLottie(() => mod.default));
        }, []);

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in zoom-in duration-500 bg-white text-black">
                <div className="w-48 h-48 mb-6">
                    {Lottie && (
                        <Lottie
                            animationData={require('../../public/Success.json')}
                            loop={false}
                            className="w-full h-full"
                        />
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-2">Session Complete</h1>
                <p className="text-gray-500 mb-8">Data captured successfully</p>

                <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Estimated Age</span>
                        <span className="text-xl font-bold text-gray-900">{ageData?.age}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-500 font-medium">Estimated Gender</span>
                        <span className="text-xl font-bold text-gray-900">{ageData?.gender}</span>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="flex gap-2 mb-8 overflow-x-auto max-w-full p-2">
                        {images.map((img, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm">
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
                    className="w-full max-w-xs px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                >
                    Start Over
                </button>
            </div>
        );
    };

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
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function EyeIcon(props: any) {
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function GlassesIcon(props: any) {
    return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v4M8 8v4m-5.172 2.828a4 4 0 015.656 0l.516.516a.75.75 0 001.06 0l.516-.516a4 4 0 015.656 0L19.5 18a2 2 0 002 2h0a2 2 0 002-2v-2a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2h0a2 2 0 002-2v-1.172z" /></svg>;
}

// Utils
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
