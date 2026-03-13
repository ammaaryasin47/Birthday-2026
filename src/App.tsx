import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

function App() {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; size: number; delay: number }>>([]);
  const hasPopped = useRef(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 30 });

  // --- DYNAMIC MOON PHASE & COLOR ---
  const moonScale = useTransform(smoothProgress, [0, 0.4, 0.7, 1], [15, 1, 1, 0.6]);
  const moonX = useTransform(smoothProgress, [0, 0.7, 0.95], ["0%", "0%", "0%"]); 
  const moonY = useTransform(smoothProgress, [0, 0.7, 0.95], ["0%", "0%", "-35%"]); 
  
  // Moon Phase: Shifting from a dark crescent feel to a bright pink glow
  const moonShadow = useTransform(
    smoothProgress, 
    [0, 0.5, 1], 
    ["inset -20px -10px 40px #1a0a14", "inset 0px 0px 10px #fff", "inset 0px 0px 0px #fff"]
  );
  const moonRotate = useTransform(smoothProgress, [0, 1], [0, 45]);

  // --- TEXT TRANSFORMS ---
  const quoteOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const hbSideOpacity = useTransform(smoothProgress, [0.4, 0.5, 0.65, 0.75], [0, 1, 1, 0]);
  const ishratOpacity = useTransform(smoothProgress, [0.8, 0.9], [0, 1]);
  const ishratY = useTransform(smoothProgress, [0.8, 0.95], ["0%", "25%"]); 

  // --- FINAL MESSAGE CARD ---
  const messageOpacity = useTransform(smoothProgress, [0.95, 1], [0, 1]);
  const messageScale = useTransform(smoothProgress, [0.95, 1], [0.9, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      if (v > 0.88 && !hasPopped.current) {
        const heartShape = confetti.shapeFromPath({ 
          path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' 
        });
        const end = Date.now() + 2000;
        (function frame() {
          confetti({ particleCount: 3, angle: 90, spread: 70, origin: { x: 0.5, y: 0.75 }, colors: ['#FF69B4', '#FF1493', '#FFC0CB'], shapes: [heartShape], scalar: 1.2 });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
        hasPopped.current = true;
      } else if (v < 0.5) { hasPopped.current = false; }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, size: Math.random() * 1.5 + 0.5, delay: Math.random() * 3 }));
    setStars(newStars);
  }, []);

  return (
    <div className="relative min-h-[700vh] bg-[#1a0a14] w-full overflow-x-hidden select-none">
      
      {/* BACKGROUND: STARS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((star) => (
          <div key={star.id} className="absolute bg-pink-200 rounded-full animate-pulse opacity-40"
            style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s`, boxShadow: '0 0 5px rgba(255, 192, 203, 0.8)' }}
          />
        ))}
      </div>

      {/* DYNAMIC MOON */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div 
          style={{ scale: moonScale, x: moonX, y: moonY, rotate: moonRotate, boxShadow: moonShadow }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-white via-pink-50 to-rose-200 shadow-[0_0_50px_rgba(255,105,180,0.3)] border border-pink-100/20"
        />
      </div>

      {/* TEXT & CARD OVERLAY */}
      <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none px-6">
        
        {/* SCENE 1: QUOTE */}
        <motion.div style={{ opacity: quoteOpacity }} className="text-center absolute">
          <h1 className="text-2xl font-serif text-rose-900 font-bold px-4 drop-shadow-sm">
            "To the moon of <br /> my dark nights"
          </h1>
        </motion.div>

        {/* SCENE 2: HAPPY BIRTHDAY */}
        <motion.div style={{ opacity: hbSideOpacity }} className="text-center absolute">
          <motion.h2 animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-3xl font-serif text-rose-950 font-black tracking-tight uppercase">
            Happy <br /> <span className="text-4xl">Birthday</span>
          </motion.h2>
        </motion.div>

        {/* SCENE 3: ISHRAT */}
        <motion.div style={{ opacity: ishratOpacity, y: ishratY }} className="flex flex-col items-center absolute">
          <h2 className="text-lg font-light text-rose-200/70 tracking-[0.3em] uppercase mb-1">Happy Birthday</h2>
          <h3 className="text-6xl font-black text-rose-500 drop-shadow-[0_0_30px_rgba(255,20,147,0.5)]">ISHRAT</h3>
        </motion.div>

        {/* FINAL MESSAGE CARD */}
        <motion.div 
          style={{ opacity: messageOpacity, scale: messageScale }}
          className="absolute bottom-[10%] w-full max-w-sm p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl pointer-events-auto"
        >
          <div className="text-center space-y-4">
            <p className="text-pink-100 font-serif italic text-lg leading-relaxed">
              "You make my world brighter just by being in it. May your life be as beautiful as you are ."
            </p>
            <div className="pt-4 text-rose-400 font-bold tracking-widest text-sm uppercase">
              With Love , Gulab Jamun 
            </div>
          </div>
        </motion.div>
      </div>

      {/* SCROLL HINT */}
      <motion.div style={{ opacity: useTransform(smoothProgress, [0, 0.02], [1, 0]) }} className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
        <span className="text-[8px] tracking-[1em] text-pink-200 font-bold uppercase mb-2">Scroll for Love</span>
        <div className="w-px h-10 bg-gradient-to-b from-pink-400 to-transparent" />
      </motion.div>

    </div>
  );
}

export default App;