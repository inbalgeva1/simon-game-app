/**
 * Entry Page (Home Screen)
 * 
 * Main landing screen with New Game, Settings, and Invite Friends.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// Simon game quadrant colors for the animated logo
const QUADRANT_COLORS = {
  green: { base: '#22c55e', lit: '#4ade80' },
  red: { base: '#ef4444', lit: '#f87171' },
  yellow: { base: '#eab308', lit: '#facc15' },
  blue: { base: '#3b82f6', lit: '#60a5fa' },
};

// Animated Simon Logo Component
function SimonLogo() {
  const [activeQuadrant, setActiveQuadrant] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuadrant((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
      {/* Green - Top Left */}
      <div
        className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-full transition-all duration-150"
        style={{
          backgroundColor: activeQuadrant === 0 ? QUADRANT_COLORS.green.lit : QUADRANT_COLORS.green.base,
          boxShadow: activeQuadrant === 0 ? `0 0 20px ${QUADRANT_COLORS.green.lit}` : 'none',
          transform: activeQuadrant === 0 ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      {/* Red - Top Right */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 rounded-tr-full transition-all duration-150"
        style={{
          backgroundColor: activeQuadrant === 1 ? QUADRANT_COLORS.red.lit : QUADRANT_COLORS.red.base,
          boxShadow: activeQuadrant === 1 ? `0 0 20px ${QUADRANT_COLORS.red.lit}` : 'none',
          transform: activeQuadrant === 1 ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      {/* Yellow - Bottom Left */}
      <div
        className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-full transition-all duration-150"
        style={{
          backgroundColor: activeQuadrant === 2 ? QUADRANT_COLORS.yellow.lit : QUADRANT_COLORS.yellow.base,
          boxShadow: activeQuadrant === 2 ? `0 0 20px ${QUADRANT_COLORS.yellow.lit}` : 'none',
          transform: activeQuadrant === 2 ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      {/* Blue - Bottom Right */}
      <div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full transition-all duration-150"
        style={{
          backgroundColor: activeQuadrant === 3 ? QUADRANT_COLORS.blue.lit : QUADRANT_COLORS.blue.base,
          boxShadow: activeQuadrant === 3 ? `0 0 20px ${QUADRANT_COLORS.blue.lit}` : 'none',
          transform: activeQuadrant === 3 ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 border-2 border-gray-700" />
    </div>
  );
}

export function EntryPage() {
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuthStore();
  const navigate = useNavigate();

  const handleNewGame = async () => {
    setLoading(true);
    try {
      // Create a new game session with default player name
      const response = await createSession('Player', '1');
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      console.error('Failed to create game:', err);
      // Still navigate to waiting room - it will handle the error
      navigate('/waiting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        {/* Logo */}
        <SimonLogo />

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Simon Says
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Color Race Edition
          </p>
        </div>

        {/* Main CTAs */}
        <div className="w-full space-y-4 mt-4">
          {/* New Game - Primary CTA */}
          <button
            onClick={handleNewGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-150 text-lg shadow-lg shadow-green-500/30"
            style={{ touchAction: 'manipulation' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🎮</span>
                New Game
              </span>
            )}
          </button>

          {/* Secondary CTAs */}
          <div className="flex gap-3">
            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 bg-gray-800/80 hover:bg-gray-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-150 border border-gray-700"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-2">
                <span>⚙️</span>
                Settings
              </span>
            </button>

            {/* Invite Friends */}
            <button
              onClick={() => navigate('/invite')}
              className="flex-1 bg-gray-800/80 hover:bg-gray-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-150 border border-gray-700"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-2">
                <span>👥</span>
                Invite
              </span>
            </button>
          </div>
        </div>

        {/* Version/Footer */}
        <p className="text-gray-600 text-xs mt-8">
          v1.0.0
        </p>
      </div>
    </div>
  );
}
