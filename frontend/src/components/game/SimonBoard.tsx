/**
 * Simon Board Component
 * 
 * Displays the 4 color buttons in a 2x2 grid.
 * Handles sequence animation and player input.
 */

import { useState, useEffect } from 'react';
import type { Color } from '../../shared/types';

// =============================================================================
// TYPES
// =============================================================================

interface SimonBoardProps {
  sequence: Color[];
  round: number;
  isShowingSequence: boolean;
  onColorClick?: (color: Color) => void;
  disabled?: boolean;
}

interface ColorButtonProps {
  color: Color;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

// =============================================================================
// COLOR BUTTON COMPONENT
// =============================================================================

const ColorButton: React.FC<ColorButtonProps> = ({ color, isActive, onClick, disabled }) => {
  // Base color classes
  const colorClasses: Record<Color, string> = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    yellow: 'bg-yellow-400 hover:bg-yellow-500',
    green: 'bg-green-500 hover:bg-green-600',
  };
  
  // Active state classes (brighter)
  const activeClasses: Record<Color, string> = {
    red: 'bg-red-300 brightness-150 scale-110',
    blue: 'bg-blue-300 brightness-150 scale-110',
    yellow: 'bg-yellow-200 brightness-150 scale-110',
    green: 'bg-green-300 brightness-150 scale-110',
  };
  
  const baseClass = colorClasses[color];
  const activeClass = activeClasses[color];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-40 h-40 rounded-2xl 
        transition-all duration-200 
        shadow-lg
        ${isActive ? activeClass : baseClass}
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
      `}
      aria-label={`${color} button`}
    >
      <span className="sr-only">{color}</span>
    </button>
  );
};

// =============================================================================
// SIMON BOARD COMPONENT
// =============================================================================

export const SimonBoard: React.FC<SimonBoardProps> = ({
  sequence,
  round,
  isShowingSequence,
  onColorClick,
  disabled = false,
}) => {
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [animationIndex, setAnimationIndex] = useState<number>(0);
  
  // Animate sequence when showing
  useEffect(() => {
    if (!isShowingSequence || sequence.length === 0) {
      setActiveColor(null);
      setAnimationIndex(0);
      return;
    }
    
    // Animation constants (matching backend)
    const SHOW_DURATION = 1000; // 1 second per color
    const SHOW_GAP = 200; // 200ms gap between colors
    
    let currentIndex = 0;
    let timeoutId: number;
    
    const showNextColor = () => {
      if (currentIndex >= sequence.length) {
        // Animation complete
        setActiveColor(null);
        return;
      }
      
      const color = sequence[currentIndex];
      
      // Light up the color
      setActiveColor(color);
      setAnimationIndex(currentIndex);
      
      // Dim after SHOW_DURATION
      setTimeout(() => {
        setActiveColor(null);
        
        // Show next color after gap
        currentIndex++;
        timeoutId = setTimeout(showNextColor, SHOW_GAP);
      }, SHOW_DURATION);
    };
    
    // Start animation
    showNextColor();
    
    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      setActiveColor(null);
    };
  }, [isShowingSequence, sequence]);
  
  // Handle color button click
  const handleColorClick = (color: Color) => {
    if (disabled || isShowingSequence) return;
    
    // Brief visual feedback
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);
    
    // Call parent handler
    if (onColorClick) {
      onColorClick(color);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Round Display */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">
          Round {round}
        </h2>
        <p className="text-lg text-gray-300">
          {isShowingSequence 
            ? '👀 Watch the sequence!' 
            : disabled 
              ? '⏸️ Waiting...' 
              : '🎮 Your turn!'}
        </p>
      </div>
      
      {/* Color Grid (2x2) */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-gray-800 rounded-3xl shadow-2xl">
        {/* Top Row: Red, Blue */}
        <ColorButton
          color="red"
          isActive={activeColor === 'red'}
          onClick={() => handleColorClick('red')}
          disabled={disabled || isShowingSequence}
        />
        <ColorButton
          color="blue"
          isActive={activeColor === 'blue'}
          onClick={() => handleColorClick('blue')}
          disabled={disabled || isShowingSequence}
        />
        
        {/* Bottom Row: Yellow, Green */}
        <ColorButton
          color="yellow"
          isActive={activeColor === 'yellow'}
          onClick={() => handleColorClick('yellow')}
          disabled={disabled || isShowingSequence}
        />
        <ColorButton
          color="green"
          isActive={activeColor === 'green'}
          onClick={() => handleColorClick('green')}
          disabled={disabled || isShowingSequence}
        />
      </div>
      
      {/* Sequence Display (for debugging Step 1) */}
      {isShowingSequence && (
        <div className="text-center text-gray-400 text-sm">
          Sequence: {sequence.map((c, i) => (
            <span 
              key={i} 
              className={`mx-1 ${i === animationIndex ? 'font-bold text-white' : ''}`}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimonBoard;
