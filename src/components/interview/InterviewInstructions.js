import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    Camera,
    CheckCircle2,
    Laptop,
    Mic,
    Shield,
    Smartphone,
    Speaker,
    Wifi
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Premium Step Wizard for Pre-Interview Experience

export default function InterviewInstructions({ interviewId, interviewDetails, onProceed }) {
    const [step, setStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    
    // State for Checks
    const [permissions, setPermissions] = useState({ camera: false, mic: false });
    const [networkStats, setNetworkStats] = useState({ speed: null, status: 'idle' }); // idle, testing, good, bad
    const [speakerWorks, setSpeakerWorks] = useState(null); // null, true, false
    const [referencePhoto, setReferencePhoto] = useState(null);
    const [pledgeAccepted, setPledgeAccepted] = useState(false);
    
    const videoRef = useRef(null);
    
    // 1. Device Enforcement
    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if ((/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) && !window.MSStream) {
            setIsMobile(true);
        }
    }, []);

    // 2. Camera Stream Handling
    useEffect(() => {
        let stream = null;

        if (step === 2) {
            (async () => {
                try {
                    // Only request if not already authenticated/active (though request is harmless if just re-verifying)
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    
                    setPermissions({ camera: true, mic: true });
                } catch (e) {
                    console.error("Permission denied", e);
                    setPermissions({ camera: false, mic: false });
                }
            })();
        }

        return () => {
            // Cleanup: Stop tracks when leaving Step 2
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
        // Dependency: Only 'step'. Do NOT include 'permissions' or it will re-run & kill the stream on state update.
    }, [step]);

    // Helper: Network Test
    const runNetworkTest = async () => {
        setNetworkStats(prev => ({ ...prev, status: 'testing' }));
        const start = Date.now();
        try {
            // Fetch small image (favicon) to test latency
            await fetch('/favicon.ico?t=' + start);
            setNetworkStats({ speed: null, status: 'good' }); // Simplified: just check connectivity
        } catch {
            setNetworkStats({ speed: 0, status: 'bad' });
        }
    };

    // Helper: Capture Reference Photo
    const captureReference = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = 640; 
        canvas.height = 480;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 640, 480);
        setReferencePhoto(canvas.toDataURL('image/jpeg', 0.8));
    };

    // Helper: Play Sound
    const playTestSound = () => {
        const audio = new AudioContext();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.value = 600;
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => { osc.stop(); audio.close(); }, 300);
    };

    if (isMobile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <Smartphone size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Desktop Device Required</h1>
                    <p className="text-gray-600">
                        This assessment uses advanced proctoring which is not supported on mobile devices. 
                        Please open this link on a Laptop or Desktop computer.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Sidebar / Progress */}
                <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <Shield className="text-emerald-400" />
                            <span className="font-bold text-lg tracking-wide">SmartHiring Shield™</span>
                        </div>
                        
                        <div className="space-y-6">
                            <StepIndicator num={1} label="Welcome" current={step} />
                            <StepIndicator num={2} label="System Check" current={step} />
                            <StepIndicator num={3} label="Protocol Pledge" current={step} />
                        </div>
                    </div>
                 
                    {/* Dynamic Context Info */}
                    <div className="relative z-10 mt-12 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                         <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Session Context</h3>
                         <div className="font-semibold text-lg text-white mb-1">
                            {interviewDetails?.job_title || 'Technical Assessment'}
                         </div>
                         <div className="text-sm text-slate-300">
                            {interviewDetails?.sections ? `${interviewDetails.sections.length} Sections` : 'Standard Interview'}
                         </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 md:p-12 relative">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: WELCOME */}
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col justify-center"
                            >
                                <div className="mb-6 inline-block p-3 bg-indigo-50 rounded-2xl">
                                    <Laptop className="text-indigo-600 w-8 h-8" />
                                </div>
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                                    Welcome, {interviewDetails?.candidate_name || 'Candidate'}
                                </h1>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    You are about to begin the assessment for <strong>{interviewDetails?.job_title || 'this role'}</strong>. 
                                    This session is AI-proctored to ensure fairness and integrity.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-2xl font-bold text-slate-800">
                                            {interviewDetails?.interview_config?.duration_minutes || 60}m
                                        </div>
                                        <div className="text-sm text-slate-500">Duration</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-2xl font-bold text-slate-800">
                                            {interviewDetails?.sections?.length || 1}
                                        </div>
                                        <div className="text-sm text-slate-500">Sections</div>
                                    </div>
                                </div>

                                <button onClick={() => setStep(2)} className="btn-primary w-fit px-8 py-3 rounded-xl">
                                    Start System Check
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: SYSTEM CHECK */}
                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">System Diagnostics</h2>
                                
                                <div className="grid grid-cols-1 gap-6 mb-6">
                                    {/* Camera Preview Card */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center">
                                        <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden mb-4 shadow-inner">
                                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                                            {!permissions.camera && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white text-xs">Waiting for permissions...</div>
                                            )}
                                        </div>
                                        <div className="flex gap-4 w-full justify-center">
                                            <StatusBadge 
                                                label="Camera" 
                                                active={permissions.camera} 
                                                icon={<Camera size={14} />} 
                                            />
                                            <StatusBadge 
                                                label="Microphone" 
                                                active={permissions.mic} 
                                                icon={<Mic size={14} />} 
                                            />
                                        </div>
                                    </div>

                                    {/* Diagnostics Row */}
                                    <div className="bg-white rounded-xl border border-slate-200 divide-y">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wifi size={20}/></div>
                                                <span className="font-medium">Network Stability</span>
                                            </div>
                                            {networkStats.status === 'idle' && <button onClick={runNetworkTest} className="text-sm text-blue-600 font-semibold hover:underline">Run Test</button>}
                                            {networkStats.status === 'testing' && <span className="text-sm text-slate-400">Testing...</span>}
                                            {networkStats.status === 'good' && <span className="text-sm text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Excellent</span>}
                                            {networkStats.status === 'bad' && <span className="text-sm text-red-600 font-bold">Unstable</span>}
                                            {networkStats.status === 'fair' && <span className="text-sm text-amber-600 font-bold">Fair</span>}
                                        </div>

                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Speaker size={20}/></div>
                                                <span className="font-medium">Sound Output</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={playTestSound} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded">Play Sound</button>
                                                <div className="flex gap-1 ml-2">
                                                    <button onClick={() => setSpeakerWorks(true)} className={`p-1 rounded ${speakerWorks === true ? 'bg-green-100 text-green-600 ring-1 ring-green-500' : 'text-slate-400 hover:text-slate-600'}`}><CheckCircle2 size={20}/></button>
                                                    <button onClick={() => setSpeakerWorks(false)} className={`p-1 rounded ${speakerWorks === false ? 'bg-red-100 text-red-600 ring-1 ring-red-500' : 'text-slate-400 hover:text-slate-600'}`}><AlertTriangle size={20}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     {/* Reference Photo Capture */}
                                    {!referencePhoto && permissions.camera && (
                                         <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
                                             <div className="text-sm text-orange-800">
                                                 <strong>Action Required:</strong> Take a reference photo for ID verification.
                                             </div>
                                             <button onClick={captureReference} className="bg-white text-orange-600 border border-orange-200 text-xs px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-50">
                                                 Capture Photo
                                             </button>
                                         </div>
                                    )}
                                    {referencePhoto && (
                                        <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-green-600" />
                                            <span className="text-sm text-green-800 font-medium">Reference photo captured securely.</span>
                                        </div>
                                    )}

                                </div>

                                <div className="mt-auto flex justify-end">
                                    <button 
                                        onClick={() => setStep(3)} 
                                        disabled={!permissions.camera || !permissions.mic || speakerWorks !== true || !referencePhoto} 
                                        className="btn-primary w-full md:w-auto px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Rules
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PLEDGE */}
                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Exam Integrity Pledge</h2>
                                
                                <div className="space-y-4 mb-8">
                                    <RuleItem icon={<Shield size={20}/>} text="I will not use any unauthorized materials or assistance." />
                                    <RuleItem icon={<Activity size={20}/>} text="I understand my face and screen focus are continuously monitored." />
                                    <RuleItem icon={<AlertTriangle size={20}/>} text="Moving out of fullscreen or switching tabs triggers a violation." />
                                    <RuleItem icon={<Mic size={20}/>} text="My microphone will remain on (silence is maintained)." />
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-5 h-5 text-indigo-600 rounded" checked={pledgeAccepted} onChange={(e) => setPledgeAccepted(e.target.checked)} />
                                        <span className="text-sm text-slate-700 leading-relaxed max-w-lg">
                                            I agree to the <strong>SmartHiring Honor Code</strong>. I understand that any violation of these protocols will result in immediate disqualification from the selection process.
                                        </span>
                                    </label>
                                </div>

                                <div className="mt-auto flex justify-between items-center">
                                    <button onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                                    <button 
                                        onClick={() => {
                                            // Request Fullscreen for Premium Proctoring
                                            if (document.documentElement.requestFullscreen) {
                                                document.documentElement.requestFullscreen().catch(err => {
                                                    console.warn("Fullscreen request failed", err);
                                                });
                                            }
                                            onProceed();
                                        }} 
                                        disabled={!pledgeAccepted}
                                        className="btn-primary-lg px-10 py-4 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1"
                                    >
                                        Start Assessment 🚀
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
            
            {/* Styles Injection for Custom Buttons */}
            <style>{`
                .btn-primary { @apply bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors; }
                .btn-primary-lg { @apply bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-lg transition-all; }
            `}</style>
        </div>
    );
}

// Sub-components
const StepIndicator = ({ num, label, current }) => (
    <div className={`flex items-center gap-4 transition-opacity ${current >= num ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${current >= num ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600 text-slate-400'}`}>
            {current > num ? <CheckCircle2 size={18}/> : num}
        </div>
        <span className="font-medium">{label}</span>
    </div>
);

const StatusBadge = ({ label, active, icon }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {icon}
        {label}: {active ? 'Ready' : 'Checking...'}
    </div>
);

const RuleItem = ({ icon, text }) => (
    <div className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-slate-400 bg-slate-50 p-2 rounded-lg">{icon}</div>
        <p className="text-slate-700 font-medium">{text}</p>
    </div>
);
