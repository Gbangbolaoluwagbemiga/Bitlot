'use client';

import React, { useEffect, useState, useRef } from 'react';

interface SpinnerProps {
  spinning: boolean;
  result: number | null; // 0-7
}

const ITEMS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍍', '🥝', '💎'];

export default function Spinner({ spinning, result }: SpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (spinning) {
      const animate = () => {
        setRotation((prev) => (prev + 10) % 360);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else if (result !== null) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Calculate final rotation to show the result at the top
      // Each item is 45deg (360/8).
      // If item 0 is at 0deg, to show it at top (which is -90deg or 270deg usually?), 
      // let's assume item 0 is at top.
      // We want to rotate so that the target item is at top.
      // Actually, let's just rotate the wheel so the pointer (fixed at top) points to the item.
      // Item i is at angle i * 45.
      // To bring item i to top (0), we rotate by -i * 45.
      const targetRotation = -(result * 45);
      // Add some full spins for effect if we were spinning? 
      // But here we just snap or transition.
      setRotation(targetRotation);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [spinning, result]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 border-8 border-gray-700 rounded-full overflow-hidden bg-white shadow-xl">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-4 h-8 bg-red-500 clip-triangle" />
        
        {/* Wheel */}
        <div 
          className="w-full h-full transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {ITEMS.map((item, index) => (
            <div
              key={index}
              className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 origin-bottom"
              style={{ 
                transform: `rotate(${index * 45}deg)`,
                transformOrigin: '50% 50%' 
              }}
            >
              <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl"
                style={{ transform: `rotate(${-index * 45}deg)` }} // Keep text upright? No, let it rotate with wheel
              >
                {/* Actually, positioning segments in a circle is harder with just absolute.
                    Let's use a simpler approach: 
                    Rotate the container for each item.
                    The item text should be near the edge.
                */}
                <span className="block mt-4">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
