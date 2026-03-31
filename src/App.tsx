import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
}

function App() {
  const [stars, setStars] = useState<Star[]>([]);
  const hasPopped = useRef(false);
  const [isGiggling, setIsGiggling] = useState(false);
  const [isBlownOut, setIsBlownOut] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 30 });

  // --- SCENE DETERMINATION ---
  const [isInScene2, setIsInScene2] = useState(false);
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setIsInScene2(v > 0.25 && v < 0.7);
    });
  }, [scrollYProgress]);

  // --- ANIMATION TRANSFORMS ---
const moonScale = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [15, 0.5, 0.5, 0.7]);
  const moonX = useTransform(smoothProgress, [0, 0.3, 0.6, 1], ["0%", "85%", "85%", "0%"]); 
  const moonY = useTransform(smoothProgress, [0, 0.3, 0.6, 1], ["0%", "-85%", "-85%", "-30%"]);
  const moonShadow = useTransform(smoothProgress, [0, 0.5, 1], ["inset -20px -10px 40px #1a0a14", "inset 0px 0px 10px #fff", "inset 0px 0px 0px #fff"]);
  const moonRotate = useTransform(smoothProgress, [0, 1], [0, 45]);

  const cakeOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]);
  const cakeScale = useTransform(smoothProgress, [0.25, 0.4], [0.5, 1]);

  const quoteOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const ishratOpacity = useTransform(smoothProgress, [0.85, 0.95], [0, 1]);
  const ishratY = useTransform(smoothProgress, [0.8, 0.95], ["20%", "0%"]); 
  const messageOpacity = useTransform(smoothProgress, [0.95, 1], [0, 1]);

// 1. Add these refs at the top of your App function with your other refs
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);

// 2. Updated Microphone & Recording Logic
// --- MICROPHONE BLOW LOGIC (CLEAN VERSION) ---
const audioContextRef = useRef<AudioContext | null>(null);

useEffect(() => {
  let stream: MediaStream;
  const startMic = async () => {
    if (!isInScene2 || isBlownOut) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (isBlownOut) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Sensitivity threshold: 55 is a gentle blow
        if (average > 55) { 
          setIsBlownOut(true);
          setTimeout(() => {
            window.scrollTo({ top: window.innerHeight * 2.5, behavior: 'smooth' });
          }, 2500);
        } else {
          requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
      audioContextRef.current = audioContext;
    } catch (err) { 
      console.log("Mic access error:", err); 
    }
  };

  startMic();
  return () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };
}, [isInScene2, isBlownOut]);
  // --- STARS & CONFETTI ---
  useEffect(() => {
    setStars(Array.from({ length: 100 }, (_, i) => ({ 
      id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, 
      size: Math.random() * 1.5 + 0.5, delay: Math.random() * 5 
    })));
  }, []);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v > 0.85 && !hasPopped.current) {
        const heart = confetti.shapeFromPath({ path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' });
        confetti({ particleCount: 50, spread: 80, origin: { x: 0.5, y: 0.7 }, colors: ['#ff4d6d', '#ff758f'], shapes: [heart] });
        hasPopped.current = true;
      } else if (v < 0.4) { hasPopped.current = false; }
    });
  }, [scrollYProgress]);

  const handleMoonTap = () => {
    if (!isInScene2 || isGiggling) return;
    setIsGiggling(true);
    confetti({ particleCount: 15, spread: 40, origin: { x: 0.8, y: 0.2 }, colors: ['#fbcfe8'] });
    setTimeout(() => setIsGiggling(false), 2000);
  };

  return (
    <div className="relative bg-[#1a0a14] w-full min-h-[300vh] overflow-x-hidden">
      {/* Background Twinkling Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((s) => (
          <div 
            key={s.id} 
            className="absolute bg-pink-100 rounded-full animate-twinkle"
            style={{ 
              left: s.left, 
              top: s.top, 
              width: `${s.size}px`, 
              height: `${s.size}px`, 
              animationDelay: `${s.delay}s`,
              animationDuration: `${3 + Math.random() * 4}s` 
            }} 
          />
        ))}
      </div>

      <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
  <div className="relative">
    {/* SHY DIALOGUE BOX - Responsive Positioning */}
    

    <motion.div 
      onClick={handleMoonTap}
      whileTap={{ scale: 0.9 }}
      animate={isGiggling ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
      style={{ 
        scale: moonScale, 
        x: moonX, 
        y: moonY, 
        rotate: moonRotate, 
        boxShadow: moonShadow,
        transformOrigin: "center center"
      }}
      /* Responsive sizing for the moon itself */
      className={`${isInScene2 ? 'pointer-events-auto cursor-pointer' : ''} relative w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-white via-pink-50 to-rose-200 border border-pink-100/20 flex items-center justify-center`}
    >
   <AnimatePresence>
        {isGiggling && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 flex justify-between px-10 items-center pointer-events-none"
          >
            <div className="flex space-x-1 -rotate-12 opacity-70">
              <div className="w-[1.5px] h-6 bg-rose-400 rounded-full" />
              <div className="w-[1.5px] h-8 bg-rose-400 rounded-full" />
              <div className="w-[1.5px] h-6 bg-rose-400 rounded-full" />
            </div>
            <div className="flex space-x-1 rotate-12 opacity-70">
              <div className="w-[1.5px] h-6 bg-rose-400 rounded-full" />
              <div className="w-[1.5px] h-8 bg-rose-400 rounded-full" />
              <div className="w-[1.5px] h-6 bg-rose-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
</motion.div>

      {/* SHY PINK LINES (Blush) */}
     
  </div>
</div>

      {/* Main Content Overlay */}
      <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none px-6">
        
        {/* Scene 1: Quote */}
        <motion.div style={{ opacity: quoteOpacity }} className="text-center absolute">
          <h1 className="text-2xl font-serif text-rose-400 font-bold drop-shadow-lg">"To the moon of <br /> my dark nights"</h1>
        </motion.div>
       
        {/* Scene 2: Anime Movie Cake */}
    {/* Scene 2: Rectangular Anime Movie Cake */}
<motion.div 
  style={{ opacity: cakeOpacity, scale: cakeScale }} 
 className="absolute flex flex-col items-center justify-center pointer-events-auto z-50 px-6 w-full pt-20"
>
  <div className="cake-container flex flex-col items-center justify-end">
    
    {/* Candles positioned on the top rectangular surface */}
    <div className="absolute -top-16 flex space-x-10 z-50">
      {[0, 1].map((i) => (
        <div key={i} className="relative w-12 h-16 flex items-end justify-center">
          <AnimatePresence>
            {!isBlownOut && (
              <motion.div exit={{ opacity: 0, transition: { duration: 0.8 } }} className="flame-bloom" />
            )}
          </AnimatePresence>
          <div className="absolute bottom-1 w-0.5 h-10 bg-gradient-to-t from-rose-300 to-rose-100 rounded-full" />
          <div className="absolute bottom-0 w-8 h-8 rounded-full rounded-tl-none rotate-45 border border-rose-200/50 bg-gradient-to-br from-rose-400 to-rose-500 shadow-lg" />
          <AnimatePresence>
            {!isBlownOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, y: -40, filter: "blur(8px) brightness(0)", transition: { duration: 0.5 } }}
                className="anime-flame absolute -top-6 z-20"
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>

    {/* Two-Layered Rectangular Cake Body */}
    <div className="relative flex flex-col items-center">
      
      {/* Top Layer (Rectangle) */}
      <div className="w-48 h-20 cake-rect-tier rounded-md z-20 flex flex-col items-center">
        {/* Cream Dollops along the edge */}
        <div className="absolute -top-2 flex space-x-4">
          {[...Array(4)].map((_, i) => <div key={i} className="cream-dollop" />)}
        </div>
        <div className="mt-8 text-[9px] font-sans text-bold text-rose-900/40 tracking-[0.4em] uppercase">
          Happy Birthday
        </div>
      </div>
      
      {/* Bottom Layer (Larger Rectangle) */}
      <div className="w-64 h-24 cake-rect-tier rounded-md mt-[-10px] z-10">
        {/* Subtle horizontal "filling" line in the middle */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-rose-400/20" />
      </div>

      {/* Glass-like Cake Stand / Reflection */}
      <div className="w-72 h-4 bg-gradient-to-r from-transparent via-rose-100/20 to-transparent rounded-full mt-2 blur-[1px]" />
    </div>
  </div>

  <motion.p className="text-rose-200 font-serif tracking-widest uppercase text-[10px] mt-16 bg-[#1a0a14]/60 px-6 py-2 rounded-full border border-rose-900/40 shadow-xl backdrop-blur-sm animate-pulse">
    {isBlownOut ? "HAPPY BIRTHDAY !✨" : "Blow gently into the mic to make a wish"}
  </motion.p>
</motion.div>

        {/* Scene 3: Finale */}
        <div className="flex flex-col items-center justify-center w-full h-full absolute pt-20">
          <motion.div style={{ opacity: ishratOpacity, y: ishratY }} className="flex flex-col items-center mb-6">
            <h2 className="text-lg font-medium text-rose-500 tracking-[0.3em] uppercase mb-2">Happy Birthday</h2>
            <h3 className="glow-text text-5xl font-black text-rose-500 uppercase">ISHRAT</h3>
          </motion.div>

          <motion.div style={{ opacity: messageOpacity }} className="w-full max-w-xs p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="text-center space-y-3">
              <p className="text-pink-300 font-serif italic text-lg leading-relaxed">
                "May Your Life Be As Beautiful As You Are"
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block text-rose-500 ml-2">❤️</motion.span>
              </p>
              <div className="pt-2 text-rose-400 font-bold tracking-[0.2em] text-[10px] uppercase">— With Love , Gulab Jamun</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Sections */}
      <div className="relative z-0">
        <div className="h-screen snap-start" />
        <div className="h-screen snap-start" />
        <div className="h-screen snap-start" />
      </div>
    </div>
  );
}

export default App;