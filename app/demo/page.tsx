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
        <div className="flex flex-col items-center justify-between min-h-screen p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white text-black">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <Logo />
                <h2 className="text-xl font-medium text-gray-500 mb-2">Third Factor</h2>
                <h1 className="text-3xl font-bold mb-4 tracking-tight">Verification for<br />Demo Applications</h1>
                <p className="text-gray-500 mb-12">
                    Complete these steps to verify your identity
                </p>

                <div className="flex items-center space-x-4 mb-16 w-full p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="h-12 w-2 rounded-full bg-blue-100">
                        <div className="h-1/2 w-full bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-left">
                        <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">Step 1</p>
                        <p className="font-semibold text-lg text-gray-900">Age estimation</p>
                    </div>
                </div>

                <button
                    onClick={() => setStep('prep')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95"
                >
                    Continue
                </button>

                <p className="mt-6 text-xs text-gray-400">
                    By continuing, you acknowledge our <a href="#" className="underline hover:text-gray-600">Privacy Notice</a>
                </p>
            </div>

            <div className="pb-4 flex flex-col items-center gap-2 text-xs text-gray-400 transition-opacity duration-1000 delay-500">
                <span className="font-medium tracking-wide">Secured by</span>
                <Image src="/logopure.png" width={100} height={24} alt="Third Factor" className="h-5 w-auto opacity-40 grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
        </div>
    );

    const PrepStep = () => (
        <div className="flex flex-col items-center justify-between min-h-screen p-6 text-center animate-in fade-in slide-in-from-right-4 duration-500 bg-white text-black">
            <div className="w-full max-w-md pt-8">
                <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-black w-1/3 rounded-full"></div>
                </div>

                <h1 className="text-2xl font-bold text-left mb-4">Prepare for the camera</h1>
                <p className="text-left text-gray-600 mb-8">
                    In a moment, we'll ask you to take a selfie by smiling, this will let us know it's really you
                </p>

                {/* Illustration */}
                <div className="relative w-full h-64 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100">
                    {/* Simple CSS Phone Illustration */}
                    <div className="relative w-32 h-56 bg-white border-4 border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center p-2">
                        <div className="w-16 h-4 bg-gray-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                        <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-left text-sm text-gray-600">
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <SunIcon className="w-6 h-6 text-gray-400" />
                        <span>First, position your face in the frame</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <EyeIcon className="w-6 h-6 text-gray-400" />
                        <span>Then, turn your head slowly to both sides</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setStep('capture')}
                className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl mt-8 transition-all active:scale-95"
            >
                I'm ready
            </button>
        </div>
    );


    // Lerp helper
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const CaptureStep = () => {
        const [statusMessage, setStatusMessage] = useState("Initializing...");
        const [stage, setStage] = useState<'align' | 'right' | 'left' | 'complete'>('align');
        const [isReady, setIsReady] = useState(false);
        const [isAnalyzing, setIsAnalyzing] = useState(false);
        const [capturedImage, setCapturedImage] = useState<string | null>(null);

        // Visual State: 0-360 range for renderer simplicity, but logic handles it
        const [currentFaceAngle, setCurrentFaceAngle] = useState<number>(0);

        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // Logic refs
        const landmarkerRef = useRef<any>(null);
        const requestRef = useRef<number>(0);
        const processingRef = useRef(false);
        const lastTimeRef = useRef(-1);
        const mountedRef = useRef(true);
        const centerRef = useRef<{ x: number, y: number } | null>(null);

        // Buffered photos
        const capturedPhotosRef = useRef<{ front: string[], right: string | null, left: string | null }>({
            front: [],
            right: null,
            left: null
        });

        const convertCanvasToBase64 = (canvas: HTMLCanvasElement) => {
            return canvas.toDataURL('image/jpeg', 0.8);
        };

        const captureFrame = () => {
            if (!videoRef.current || !canvasRef.current) return null;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Reset transform to avoid accumulation, then mirror
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            ctx.drawImage(video, 0, 0);
            return convertCanvasToBase64(canvas);
        };

        // Stage Progress Refs
        const stageTimerRef = useRef<number | null>(null);
        const stageRef = useRef<'align' | 'right' | 'left' | 'complete'>('align');

        // Smoothing refs
        const prevAngleRef = useRef<number>(0);
        const strictModeRef = useRef(false);

        useEffect(() => {
            if (stage === 'align') {
                // Reset photos on start
                capturedPhotosRef.current = { front: [], right: null, left: null };
            }
        }, [stage]);

        useEffect(() => {
            mountedRef.current = true;
            stageRef.current = 'align';
            strictModeRef.current = localStorage.getItem('strictOneFace') === 'true';
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
                        videoRef.current.play().catch(() => { });
                    }

                    const originalConsoleError = console.error;
                    console.error = (...args) => {
                        if (args[0]?.includes?.('TensorFlow Lite') || args[0]?.includes?.('XNNPACK')) return;
                        originalConsoleError(...args);
                    };

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
                        numFaces: 5
                    });

                    if (!mountedRef.current) {
                        landmarker.close();
                        return;
                    }

                    landmarkerRef.current = landmarker;
                    await delay(500);
                    setIsReady(true);
                    setStatusMessage("Look straight ahead");
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
            const now = performance.now();
            if (now - lastTimeRef.current < 30) {
                requestRef.current = requestAnimationFrame(predictLoop);
                return;
            }
            lastTimeRef.current = now;

            const video = videoRef.current;
            try {
                if (video.readyState >= 2 && !video.paused && video.videoWidth > 0 && video.videoHeight > 0) {
                    const result = landmarkerRef.current.detectForVideo(video, now);
                    processResult(result);
                }
            } catch (e) { }

            requestRef.current = requestAnimationFrame(predictLoop);
        };

        const processResult = (result: any) => {
            if (!result.faceLandmarks || result.faceLandmarks.length === 0) return;
            if (isAnalyzing) return;

            if (strictModeRef.current && result.faceLandmarks.length > 1) {
                setStatusMessage("Only 1 face allowed");
                stageTimerRef.current = null; // Reset progress
                return;
            }

            const landmarks = result.faceLandmarks[0];
            const nose = landmarks[1];
            const leftCheek = landmarks[454];
            const rightCheek = landmarks[234];

            const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
            const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
            // Yaw: (Nose - Center) / Width
            const rawYaw = (nose.x - faceCenterX) / (faceWidth || 0.1);

            handleStageLogic(faceWidth, rawYaw);
        };

        const handleStageLogic = (faceWidth: number, yaw: number) => {
            // Visual mapping multiplier
            let targetAngle = -yaw * 180;

            // Clamp visual angle for smooth display logic -90 to +90
            // Yaw is approx -0.5 to 0.5
            if (targetAngle > 90) targetAngle = 90;
            if (targetAngle < -90) targetAngle = -90;

            // Smooth
            let smoothedAngle = lerp(prevAngleRef.current, targetAngle, 0.2);
            prevAngleRef.current = smoothedAngle;

            // Normalize for React State (0 = Top, however we just pass degrees and handle in render)
            setCurrentFaceAngle(smoothedAngle);

            const currentStage = stageRef.current;
            const now = Date.now();

            if (currentStage === 'align') {
                const isCentered = Math.abs(yaw) < 0.15;
                const isGoodSize = faceWidth > 0.15 && faceWidth < 0.75;

                if (isCentered && isGoodSize) {
                    setStatusMessage("Hold still...");

                    // Capture front photos
                    if (now % 400 < 50 && capturedPhotosRef.current.front.length < 3) {
                        const frame = captureFrame();
                        if (frame) capturedPhotosRef.current.front.push(frame);
                    }

                    if (!stageTimerRef.current) {
                        stageTimerRef.current = now;
                    } else if (now - stageTimerRef.current > 800) {
                        advanceStage('right');
                    }
                } else {
                    stageTimerRef.current = null;
                    if (faceWidth < 0.15) setStatusMessage("Come closer");
                    else if (faceWidth > 0.75) setStatusMessage("Move back");
                    else setStatusMessage("Look straight ahead");
                }
            }
            else if (currentStage === 'right') {
                // Target: Angle > 35 degrees (User turned Right)
                const isTurnedRight = smoothedAngle > 30;

                if (isTurnedRight) {
                    if (!capturedPhotosRef.current.right) {
                        capturedPhotosRef.current.right = captureFrame();
                    }

                    if (!stageTimerRef.current) stageTimerRef.current = now;
                    else if (now - stageTimerRef.current > 200) { // Fast reaction
                        advanceStage('left');
                    }
                } else {
                    stageTimerRef.current = null;
                    setStatusMessage("Turn head Right →");
                }
            }
            else if (currentStage === 'left') {
                // Target: Angle < -35 degrees (User turned Left)
                const isTurnedLeft = smoothedAngle < -30;

                if (isTurnedLeft) {
                    if (!capturedPhotosRef.current.left) {
                        capturedPhotosRef.current.left = captureFrame();
                    }

                    if (!stageTimerRef.current) stageTimerRef.current = now;
                    else if (now - stageTimerRef.current > 200) {
                        advanceStage('complete');
                    }
                } else {
                    stageTimerRef.current = null;
                    setStatusMessage("← Turn head Left");
                }
            }
        };

        const advanceStage = (next: 'align' | 'right' | 'left' | 'complete') => {
            stageTimerRef.current = null;
            if (next === 'right') {
                setStage('right');
                stageRef.current = 'right';
                setStatusMessage("Turn head Right →");
            } else if (next === 'left') {
                setStage('left');
                stageRef.current = 'left';
                setStatusMessage("← Turn head Left");
            } else if (next === 'complete') {
                setStage('complete');
                stageRef.current = 'complete';
                captureSequence();
            }
        };

        const captureSequence = async () => {
            processingRef.current = false;

            // Prepare final payload: 3 front, 1 right, 1 left
            let finalFrames: string[] = [];

            // 1. Front
            finalFrames.push(...capturedPhotosRef.current.front);
            // Fallback if missing, grab current
            const currentFrame = captureFrame();

            // If we have nothing at all, we must abort or just try to capture now
            if (!currentFrame && finalFrames.length === 0) {
                setStatusMessage("Capture failed");
                setIsAnalyzing(false);
                return;
            }

            // Fill front to 3
            while (finalFrames.length < 3) {
                finalFrames.push(currentFrame || finalFrames[0]);
            }

            // 2. Right
            if (capturedPhotosRef.current.right) finalFrames.push(capturedPhotosRef.current.right);
            else finalFrames.push(currentFrame || finalFrames[0]);

            // 3. Left
            if (capturedPhotosRef.current.left) finalFrames.push(capturedPhotosRef.current.left);
            else finalFrames.push(currentFrame || finalFrames[0]);

            // Show one of the images locally
            setCapturedImage(finalFrames[0]);

            setIsAnalyzing(true);
            setStatusMessage("Verifying...");

            try {
                const response = await fetch('/api/detect-face', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(finalFrames),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                if (data.result === false) {
                    setStatusMessage("ohh ohh; your face is too good to be dectected");
                    setIsAnalyzing(false);
                    await delay(3000); // Show message for 3 seconds

                    // Reset to try again
                    setCapturedImage(null);
                    setStage('align');
                    stageRef.current = 'align';
                    processingRef.current = true;
                    predictLoop();
                    return;
                }

                if (data.error) {
                    throw new Error(data.error);
                }

                // Map the response to our state
                setAgeData({
                    age: data.age,
                    gender: data.gender
                });

                if (data.success_photo) {
                    setImages([data.success_photo]);
                } else {
                    setImages(finalFrames);
                }

                setStep('result');

            } catch (error) {
                console.error("Verification Error:", error);
                setStatusMessage("Verification Failed");
                await delay(2000);

                // Reset to try again
                setIsAnalyzing(false);
                setCapturedImage(null);
                setStage('align');
                stageRef.current = 'align';
                processingRef.current = true;
                predictLoop();
            }
        };

        const totalDashes = 60;

        return (
            <div className="flex flex-col min-h-screen bg-white text-black relative overflow-hidden font-sans">
                {/* Header */}
                <div className="flex items-center justify-between p-6 z-20">
                    <button onClick={() => setStep('welcome')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center gap-2 opacity-80">
                        <Image src="/logopure.png" width={120} height={30} alt="Third Factor" className="h-6 w-auto object-contain" />
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md mx-auto">

                    {/* Ring + Video Container */}
                    <div className="relative w-80 h-80 flex items-center justify-center mb-16">

                        <div className="absolute inset-[-24px] w-[368px] h-[368px]">
                            <svg className="w-full h-full" viewBox="0 0 360 360">
                                {Array.from({ length: totalDashes }).map((_, i) => {
                                    // Map i to angle: 0 is Top.
                                    const angleStep = 360 / totalDashes; // 6 degrees per dash
                                    const rot = i * angleStep - 90; // SVG rotation degrees (start at Top)

                                    // Calculate Logical Angle (-180 to 180, 0 is Top) from the index
                                    // i=0 -> 0 deg. i=15 -> 90 deg. i=45 -> 270 (-90) deg.
                                    let logicalAngle = i * angleStep;
                                    if (logicalAngle > 180) logicalAngle -= 360;

                                    const cx = 180;
                                    const cy = 180;
                                    const r1 = 150;
                                    const r2 = 165;

                                    const rad = (rot * Math.PI) / 180;
                                    const x1 = cx + r1 * Math.cos(rad);
                                    const y1 = cx + r1 * Math.sin(rad);
                                    const x2 = cx + r2 * Math.cos(rad);
                                    const y2 = cx + r2 * Math.sin(rad);

                                    // -- VISUAL LOGIC --
                                    let isTarget = false;
                                    let isCursor = false;
                                    let isFilled = false;

                                    // 1. Cursor Logic (Smooth dots) - Wider for visibility
                                    // currentFaceAngle is -90 to +90 approx.
                                    const dist = Math.abs(logicalAngle - currentFaceAngle);
                                    if (dist < 12) isCursor = true; // Highlight dashes within 12 degrees

                                    // 2. Target Zones logic
                                    if (stage === 'right') {
                                        // Target is +30 to +90
                                        if (logicalAngle > 30 && logicalAngle < 90) isTarget = true;
                                    } else if (stage === 'left') {
                                        // Target is -30 to -90
                                        if (logicalAngle < -30 && logicalAngle > -90) isTarget = true;
                                    }

                                    // 3. Compounding Fill Effect (Blue Path)
                                    // If we are in Right stage, fill from 0 to current Angle if positive
                                    if (stage === 'right' && currentFaceAngle > 0 && logicalAngle > 0 && logicalAngle < currentFaceAngle) {
                                        isFilled = true;
                                    }
                                    // If we are in Left stage, fill from 0 to current Angle if negative
                                    // Also keep Right side filled? Maybe keep it simple: just active path.
                                    if (stage === 'left' && currentFaceAngle < 0 && logicalAngle < 0 && logicalAngle > currentFaceAngle) {
                                        isFilled = true;
                                    }

                                    let strokeColor = '#e2e8f0'; // slate-200 inactive
                                    let strokeWidth = "2";
                                    let opacity = "1";

                                    if (isTarget) {
                                        strokeColor = '#bfdbfe'; // light blue target
                                        strokeWidth = "3";
                                    }

                                    if (isFilled) {
                                        strokeColor = '#bfdbfe'; // light blue trail
                                        strokeWidth = "3";
                                    }

                                    if (isCursor) {
                                        strokeColor = '#2563eb'; // blue-600 cursor
                                        strokeWidth = "5";
                                        opacity = "1";
                                    }

                                    // Success fill
                                    if (isAnalyzing || stage === 'complete') {
                                        strokeColor = '#10b981';
                                        strokeWidth = "3";
                                    }

                                    return (
                                        <line
                                            key={i}
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke={strokeColor}
                                            strokeWidth={strokeWidth}
                                            strokeLinecap="round"
                                            className="transition-colors duration-150"
                                            style={{ opacity }}
                                        />
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Video Circle */}
                        <div className={`w-64 h-64 rounded-full overflow-hidden border-[6px] border-white relative z-10 bg-white shadow-xl transition-transform duration-500 ${isAnalyzing ? 'scale-95' : 'scale-100'}`}>
                            {capturedImage && isAnalyzing ? (
                                <div className="w-full h-full relative">
                                    <Image src={capturedImage} alt="Analysis" fill className="object-cover blur-sm opacity-50" />
                                    <div className="absolute inset-0 bg-emerald-500/10" />
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
                                />
                            )}
                        </div>

                        {/* Status Overlay */}
                        {isAnalyzing && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                                    <span className="text-emerald-600 font-semibold animate-pulse">Processing</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instruction Text */}
                    <div className="text-center px-6 h-20">
                        <h2 className={`text-3xl font-bold tracking-tight text-slate-900 transition-all duration-300 ${isAnalyzing ? 'scale-95 opacity-50' : 'scale-100'}`}>
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

                <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
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
                    className="w-full max-w-xs px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95"
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

function convertCanvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL("image/jpeg");
}
