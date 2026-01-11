import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

// Simon game quadrant colors
const QUADRANT_COLORS = {
  green: { base: '#22c55e', lit: '#4ade80' },
  red: { base: '#ef4444', lit: '#f87171' },
  yellow: { base: '#eab308', lit: '#facc15' },
  blue: { base: '#3b82f6', lit: '#60a5fa' },
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState(0);

  // Animate quadrants lighting up in sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuadrant((prev) => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start fade out after (duration - 500ms) to allow fade animation
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500);

    // Complete after full duration
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Simon Game Circle */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          {/* Green - Top Left */}
          <div
            className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-full transition-all duration-150"
            style={{
              backgroundColor: activeQuadrant === 0 ? QUADRANT_COLORS.green.lit : QUADRANT_COLORS.green.base,
              boxShadow: activeQuadrant === 0 ? `0 0 30px ${QUADRANT_COLORS.green.lit}, 0 0 60px ${QUADRANT_COLORS.green.lit}` : 'none',
              transform: activeQuadrant === 0 ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Red - Top Right */}
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2 rounded-tr-full transition-all duration-150"
            style={{
              backgroundColor: activeQuadrant === 1 ? QUADRANT_COLORS.red.lit : QUADRANT_COLORS.red.base,
              boxShadow: activeQuadrant === 1 ? `0 0 30px ${QUADRANT_COLORS.red.lit}, 0 0 60px ${QUADRANT_COLORS.red.lit}` : 'none',
              transform: activeQuadrant === 1 ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Yellow - Bottom Left */}
          <div
            className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-full transition-all duration-150"
            style={{
              backgroundColor: activeQuadrant === 2 ? QUADRANT_COLORS.yellow.lit : QUADRANT_COLORS.yellow.base,
              boxShadow: activeQuadrant === 2 ? `0 0 30px ${QUADRANT_COLORS.yellow.lit}, 0 0 60px ${QUADRANT_COLORS.yellow.lit}` : 'none',
              transform: activeQuadrant === 2 ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Blue - Bottom Right */}
          <div
            className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full transition-all duration-150"
            style={{
              backgroundColor: activeQuadrant === 3 ? QUADRANT_COLORS.blue.lit : QUADRANT_COLORS.blue.base,
              boxShadow: activeQuadrant === 3 ? `0 0 30px ${QUADRANT_COLORS.blue.lit}, 0 0 60px ${QUADRANT_COLORS.blue.lit}` : 'none',
              transform: activeQuadrant === 3 ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Center Circle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-900 border-4 border-gray-700 flex items-center justify-center"
          >
            <span className="text-2xl sm:text-3xl">🎮</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Simon Says
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};
