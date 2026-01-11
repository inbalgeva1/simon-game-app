/**
 * Profile Setup Page (US3)
 * 
 * First-time player name customization.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { setPlayerName, validatePlayerName, completeSetup } = useSettingsStore();
  
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [syncError, setSyncError] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleContinue = async () => {
    // Validate the name
    const validation = validatePlayerName(name);
    if (!validation.valid) {
      setError(validation.error || 'Invalid name');
      return;
    }

    // Save the name locally
    const result = setPlayerName(name);
    if (!result.success) {
      setError(result.error || 'Failed to save name');
      return;
    }

    // Try to sync to server (optional - for cloud sync)
    try {
      // Simulate server sync - in real app this would be an API call
      // await syncProfileToServer(name);
    } catch (err) {
      // Show toast but continue anyway
      setSyncError(true);
      setTimeout(() => setSyncError(false), 3000);
    }

    // Mark setup as complete and navigate to main screen
    completeSetup();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">👤</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Customize your player profile
            </h1>
            <p className="text-gray-400">
              Choose a nickname for leaderboards and friends
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={20}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-green-500 focus:border-transparent'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleContinue();
                  }
                }}
              />
              
              {/* Character count */}
              <div className="flex justify-between mt-2">
                <div>
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  {name.length}/20
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={name.trim().length < 3}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-150 text-lg shadow-lg shadow-green-500/30 disabled:shadow-none mt-4"
            >
              Continue
            </button>
          </div>

          {/* Hints */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              3-20 characters • Be creative! 🎮
            </p>
          </div>
        </div>

        {/* Sync Error Toast */}
        {syncError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-yellow-900 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in">
            Online sync failed, we'll try again later.
          </div>
        )}
      </div>
    </div>
  );
}

