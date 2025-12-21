'use client';

import React, { useEffect, useState, useRef } from 'react';

interface SpinnerProps {
  spinning: boolean;
  result: number | null; // 0-7
}

const ITEMS = [
  { label: '😢', value: '0', color: '#ef4444' },    // 0: No Reward
  { label: '10', value: '10', color: '#3b82f6' },   // 1: 10 BLOT
  { label: '20', value: '20', color: '#8b5cf6' },   // 2: 20 BLOT
  { label: '50', value: '50', color: '#10b981' },   // 3: 50 BLOT
  { label: '😢', value: '0', color: '#ef4444' },    // 4: No Reward
  { label: '100', value: '100', color: '#f59e0b' }, // 5: 100 BLOT
  { label: '200', value: '200', color: '#f97316' }, // 6: 200 BLOT
  { label: '500', value: '500', color: '#ec4899' }, // 7: 500 BLOT
];

export default function Spinner({ spinning, result }: SpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (spinning) {
      // Continuous spinning loop
      const animate = () => {
        setRotation((prev) => prev + 15);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else if (result !== null) {
      // Stop spinning at the result
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      // Calculate target rotation to land on the result
      // We want to land on - (result * 45) degrees
      // But we need to make sure we rotate FORWARD to get there from current rotation
      // Current rotation is `rotation`
      // Target base is `targetBase = -(result * 45)`
      // We want `final = targetBase + k * 360` such that `final > rotation + 720` (at least 2 full spins more)
      
      const targetBase = -(result * 45);
      const currentMod = rotation % 360; // 0 to 360 (or negative)
      
      // Let's just add enough full rotations to the base target until it's comfortably ahead
      let target = targetBase;
      while (target < rotation + 720) {
        target += 360;
      }
      
      setRotation(target);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [spinning, result]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-80 h-80 border-4 border-gray-800 rounded-full shadow-2xl overflow-hidden bg-gray-900">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md" />
        
        {/* Wheel */}
        <div 
          className="w-full h-full relative"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'none' : 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' 
          }}
        >
          {ITEMS.map((item, index) => (
            <div
              key={index}
              className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 origin-center"
              style={{ 
                transform: `rotate(${index * 45}deg)`,
              }}
            >
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-24 origin-bottom flex flex-col items-center justify-start pt-4"
              >
                <div 
                    className="text-white font-bold text-lg flex flex-col items-center"
                    style={{ textShadow: '1px 1px 2px black' }}
                >
                  <span className="text-2xl mb-1">{item.label}</span>
                  {item.value !== '0' && <span className="text-xs opacity-90">BLOT</span>}
                </div>
              </div>
            </div>
          ))}
          
          {/* Central Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full border-4 border-gray-600 z-10 flex items-center justify-center">
            <span className="text-2xl">🎰</span>
          </div>
        </div>
      </div>
    </div>
  );
}
