import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { pickWeighted } from '../utils/random';
import { Play, RotateCw } from 'lucide-react';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

export default function Spinner({ items, theme, onResult, locked = false }) {
  const [spinning, setSpinning] = useState(false);
  const controls = useAnimation();
  const rotationRef = useRef(0);
  
  const sliceAngle = 360 / items.length;

  const playClickSound = () => {
    // Simple oscillator beep
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(0.1);
  };

  const handleSpin = async () => {
    if (spinning || locked) return;
    setSpinning(true);

    // Pick result
    const result = pickWeighted(items);
    const resultIndex = items.findIndex(i => i.id === result.id);
    
    // Calculate rotation
    // We want the result index to land at the TOP (270 degrees or -90 degrees visually, but let's say pointer is at 0 degrees top)
    // If 0 is top, and we rotate clockwise:
    // Item 0 is at 0-X deg.
    // To land on Item 0, we need -Rotation % 360 to fall within Item 0's arc.
    
    // Let's simplify: Pointer is at TOP (0 deg).
    // Segment i starts at i * sliceAngle. Center is (i + 0.5) * sliceAngle.
    // To bring segment i to 0 deg, we rotate -(i + 0.5) * sliceAngle.
    // Add extra spins (5 * 360).
    
    const targetAngle = (resultIndex + 0.5) * sliceAngle;
    const extraSpins = 360 * 5; // 5 full spins
    // Add random jitter within the slice (-sliceAngle/2 + padding to sliceAngle/2 - padding)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.8);
    
    // Target rotation: We want the final rotation to put the target angle at the top (which is effectively -targetAngle)
    // Actually, if we rotate the wheel +angle, the item at -angle comes to top.
    // Current rotation is rotationRef.current.
    // We want to add rotation.
    
    const finalRotation = rotationRef.current + extraSpins + (360 - targetAngle) + jitter;
    // Align logic:
    // If we are at 0, and want index 0 (center 45deg for 4 items) to be at top (0deg).
    // We need to rotate -45deg. 
    // Wait, standard SVG coordinates: 0 is right (3 o'clock). 
    // We will rotate the SVG so -90 (top) is the start.
    // Let's assume standard math: 0 is right.
    // Segment 0: 0 to 90. Center 45.
    // Pointer is at -90 (Top).
    // To bring 45 to -90, we rotate -135. 
    
    // Let's handle it purely relatively.
    // The wheel spins CLOCKWISE.
    // The pointer is static at TOP.
    // To land on a specific slice, we calculate where that slice is, and spin enough to put it under the pointer.
    
    const visualSliceOffset = 360 - (resultIndex * sliceAngle); // Start of slice in global circle if we didn't spin
    // Add random spot in slice
    const randomOffset = Math.random() * sliceAngle;
    const stopAngle = visualSliceOffset - randomOffset; 
    // This is getting complex. Let's do the "spin by arbitrary amount" and check where we landed.
    // No, we need to rig it.
    
    // Easier way: 
    // 1. Pick result.
    // 2. Calculate center angle of that result segment.
    // 3. We want that angle to end up at -90 (Top).
    // 4. Current rotation % 360 is X.
    // 5. Delta = Target - Current.
    
    // Simplified:
    // SVG starts with item 0 at 0 degrees (Right).
    // We rotate the container -90deg so item 0 starts at Top.
    // Now item 0 covers 0 to sliceAngle.
    // Pointer is at 0 (Top).
    // To select item i (angle i*slice to (i+1)*slice), we need to rotate the WHEEL counter-clockwise?
    // Usually wheels spin Clockwise.
    // If wheel spins CW by X degrees. 0 moves to X.
    // We want item i (center (i+0.5)*slice) to end up at 360 (0).
    // So final rotation R: (R + center) % 360 = 0? No.
    // Visual position = (OriginalPosition + Rotation) % 360.
    // We want VisualPosition = 0 (Top).
    // Rotation = -OriginalPosition.
    // Rotation = 360 - ((resultIndex + 0.5) * sliceAngle).
    
    const itemsCount = items.length;
    const segmentAngle = 360 / itemsCount;
    const targetIndex = resultIndex;
    
    // Offset to center the segment at the top (0 degrees)
    // Default: Segment 0 starts at 0deg (if we rotate -90 initially).
    // Let's say we don't rotate -90 initially in CSS, we do it in math.
    // 0 deg = 3 o'clock. Pointer = 12 o'clock (270 deg).
    // Segment 0 center = segmentAngle / 2.
    // We want Segment 0 center to be at 270.
    // Rotation + segmentAngle/2 = 270. -> Rotation = 270 - segmentAngle/2.
    
    // Let's force a simpler model:
    // Pointer is at TOP.
    // CSS Transform rotates the whole div.
    // We calculate "how many degrees to add" to reach the target.
    
    const spinCount = 5 + Math.floor(Math.random() * 3); // 5-8 spins
    const baseRotation = 360 * spinCount;
    
    // Where are we now?
    const currentRot = rotationRef.current % 360;
    
    // Where is the target relative to the wheel start (0)?
    // Item i is at [i*slice, (i+1)*slice]. Center: (i+0.5)*slice.
    const targetCenter = (targetIndex + 0.5) * sliceAngle;
    
    // We want the wheel to end such that `targetCenter` is at the Pointer.
    // Let's assume Pointer is at 0 degrees (Top) in the Wheel's coordinate space *after rotation*.
    // Wait, the pointer is fixed in world space. The wheel rotates.
    // If wheel rotates +90 (CW), 0 goes to 90.
    // We want targetCenter to go to PointerPosition.
    // Let's define PointerPosition = 270 (Top, if 0 is Right).
    // (targetCenter + FinalRotation) % 360 = 270.
    // FinalRotation = 270 - targetCenter.
    
    // Add multiple of 360 to ensure we spin forward.
    let targetRotation = (270 - targetCenter);
    // Ensure it's positive and far enough ahead of current
    while (targetRotation < rotationRef.current + 360 * 5) {
      targetRotation += 360;
    }
    
    // Add some randomness within the slice (+/- slice/2 * 0.8)
    const randomJitter = (Math.random() - 0.5) * (sliceAngle * 0.8);
    targetRotation += randomJitter;

    rotationRef.current = targetRotation;

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 4, type: 'spring', stiffness: 50, damping: 15, mass: 1 }
    });
    
    setSpinning(false);
    playClickSound(); // Ding!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onResult(result);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-8 h-8 bg-red-500 rotate-45 transform shadow-lg border-2 border-white rounded-sm"></div>
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden relative"
          style={{ borderColor: theme.border ? undefined : 'white' }}
          animate={controls}
          initial={{ rotate: 0 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-0">
            {items.map((item, index) => {
              // Create slice path
              // Convert polar to cartesian
              const startAngle = index * sliceAngle;
              const endAngle = (index + 1) * sliceAngle;
              
              // Helper to get coords
              const getCoords = (percent) => {
                const x = 50 + 50 * Math.cos(2 * Math.PI * percent);
                const y = 50 + 50 * Math.sin(2 * Math.PI * percent);
                return [x, y];
              };

              const [x1, y1] = getCoords(startAngle / 360);
              const [x2, y2] = getCoords(endAngle / 360);
              
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              
              const pathData = `
                M 50 50
                L ${x1} ${y1}
                A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              return (
                <path
                  key={item.id}
                  d={pathData}
                  fill={item.color || COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
          
          {/* Text Labels */}
          {items.map((item, index) => {
             const angle = (index + 0.5) * sliceAngle;
             const rotate = angle;
             return (
               <div
                 key={item.id}
                 className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                 style={{ transform: `rotate(${rotate}deg)` }}
               >
                 <div className="translate-x-16 sm:translate-x-20 text-white font-bold text-xs sm:text-sm drop-shadow-md text-center w-24 -rotate-90">
                   {item.label}
                 </div>
               </div>
             );
          })}
        </motion.div>
        
        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center z-10 border-4 border-gray-100">
          <div className={`w-10 h-10 rounded-full ${spinning ? 'animate-spin' : ''} opacity-50`}>
             <RotateCw className="w-full h-full text-gray-400" />
          </div>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || locked}
        className={`
          px-8 py-4 rounded-full text-2xl font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95
          flex items-center gap-3
          ${locked 
            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
            : `${theme.primary} text-white hover:brightness-110`
          }
        `}
      >
        {spinning ? 'Spinning...' : locked ? 'Locked' : 'SPIN!'}
        {!spinning && !locked && <Play size={24} fill="currentColor" />}
      </button>
    </div>
  );
}
