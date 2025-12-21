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
      const animate = () => {
        setRotation((prev) => (prev + 15) % 360);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else if (result !== null) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Item i is at angle i * 45.
      // To bring item i to top (0), we rotate by -i * 45.
      // Adjust for the pointer position (top center).
      // If we want item `result` to be at the top, we need to rotate the wheel such that 
      // the center of the segment `result` aligns with 0deg (top).
      // Each segment is 45deg. Center of segment 0 is at 22.5deg if we start at 0?
      // Let's assume segment 0 starts at -22.5deg and ends at 22.5deg (centered at 0).
      // Then segment i is centered at i * 45.
      // To bring segment i to 0, we rotate by -i * 45.
      const targetRotation = -(result * 45); 
      setRotation(targetRotation);
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
          className="w-full h-full relative transition-transform duration-[3s] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {ITEMS.map((item, index) => (
            <div
              key={index}
              className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 origin-center"
              style={{ 
                transform: `rotate(${index * 45}deg)`,
              }}
            >
              {/* Segment Background */}
              {/* Using a conic gradient slice approach via clip-path is cleaner for wedges, 
                  but CSS rotation of a simple rectangular div that is 50% width and masked works too.
                  Alternatively, simpler approach:
                  Just place the text. We can use a background color for the whole wheel or slices.
              */}
              
              {/* Let's make actual wedges using conic-gradient on the container? 
                  No, let's use skewed divs or just simple text placement with a colored background circle.
                  Actually, styling individual wedges is tricky without SVG or clip-path.
                  Let's try a simple approach: Text and a small colored dot/background.
              */}
              
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-24 origin-bottom flex flex-col items-center justify-start pt-4"
                style={{ 
                  // This div represents the top half wedge when unrotated.
                  // We need to offset it properly?
                  // Actually, sticking to the previous logic:
                  // The container is rotated `index * 45`.
                  // So this inner div is pointing "up" from the center for that segment.
                }}
              >
                <div 
                    className="text-white font-bold text-lg flex flex-col items-center transform -rotate-0"
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
