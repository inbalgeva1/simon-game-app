/**
 * Settings Page
 * 
 * Game settings and preferences.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  return (
    <div 
      className="min-h-screen flex flex-col p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-gray-300 active:scale-95 transition-all p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Settings List */}
      <div className="flex-1 space-y-4 max-w-md mx-auto w-full">
        {/* Sound Toggle */}
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <div>
                <p className="text-white font-medium">Sound Effects</p>
                <p className="text-gray-400 text-sm">Play sounds during game</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-14 h-8 rounded-full transition-colors duration-200 ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Vibration Toggle */}
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📳</span>
              <div>
                <p className="text-white font-medium">Vibration</p>
                <p className="text-gray-400 text-sm">Haptic feedback on tap</p>
              </div>
            </div>
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`w-14 h-8 rounded-full transition-colors duration-200 ${
                vibrationEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  vibrationEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-white font-medium">Difficulty</p>
              <p className="text-gray-400 text-sm">Game speed and complexity</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all capitalize ${
                  difficulty === level
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 mt-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-white font-medium">About</p>
              <p className="text-gray-400 text-sm">Simon Says v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

