/**
 * Settings Store
 * 
 * Manages player profile and game settings with local persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Profanity filter - basic list of offensive words
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'dick', 'cock', 
  'pussy', 'slut', 'whore', 'nigger', 'faggot', 'retard'
];

export type GameSpeed = 'auto' | 'easy' | 'medium' | 'hard';
export type SoundTheme = 'original' | 'piano' | 'dramatic';

interface SettingsState {
  // Player Profile
  playerName: string;
  hasCompletedSetup: boolean;
  
  // Game Settings
  gameSpeed: GameSpeed;
  soundEnabled: boolean;
  soundTheme: SoundTheme;
  vibrationEnabled: boolean;
  
  // Actions
  setPlayerName: (name: string) => { success: boolean; error?: string };
  validatePlayerName: (name: string) => { valid: boolean; error?: string };
  completeSetup: () => void;
  setGameSpeed: (speed: GameSpeed) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundTheme: (theme: SoundTheme) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

// Name validation constants
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 20;

// Validate player name
function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  
  // Check if empty
  if (!trimmed) {
    return { valid: false, error: 'Name is required' };
  }
  
  // Check length
  if (trimmed.length < MIN_NAME_LENGTH) {
    return { valid: false, error: `Name must be at least ${MIN_NAME_LENGTH} characters` };
  }
  
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be at most ${MAX_NAME_LENGTH} characters` };
  }
  
  // Check for whitespace-only
  if (/^\s+$/.test(name)) {
    return { valid: false, error: 'Name cannot be only whitespace' };
  }
  
  // Check for profanity
  const lowerName = trimmed.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lowerName.includes(word)) {
      return { valid: false, error: 'Please choose a different name' };
    }
  }
  
  return { valid: true };
}

// Get speed delay in milliseconds
export function getSpeedDelay(speed: GameSpeed, sequenceLength: number = 1): number {
  switch (speed) {
    case 'easy':
      return 1200;
    case 'medium':
      return 800;
    case 'hard':
      return 500;
    case 'auto':
    default:
      // Auto speed: starts easy and increases with sequence length
      if (sequenceLength <= 4) return 1000;
      if (sequenceLength <= 8) return 800;
      if (sequenceLength <= 12) return 600;
      return 500;
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      playerName: '',
      hasCompletedSetup: false,
      gameSpeed: 'auto',
      soundEnabled: true,
      soundTheme: 'original',
      vibrationEnabled: true,
      
      // Actions
      validatePlayerName: (name: string) => {
        return validateName(name);
      },
      
      setPlayerName: (name: string) => {
        const validation = validateName(name);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
        
        set({ playerName: name.trim() });
        return { success: true };
      },
      
      completeSetup: () => {
        set({ hasCompletedSetup: true });
      },
      
      setGameSpeed: (speed: GameSpeed) => {
        // Validate speed value
        const validSpeeds: GameSpeed[] = ['auto', 'easy', 'medium', 'hard'];
        if (!validSpeeds.includes(speed)) {
          set({ gameSpeed: 'auto' }); // Default to auto if invalid
          return;
        }
        set({ gameSpeed: speed });
      },
      
      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },
      
      setSoundTheme: (theme: SoundTheme) => {
        const validThemes: SoundTheme[] = ['original', 'piano', 'dramatic'];
        if (!validThemes.includes(theme)) {
          set({ soundTheme: 'original' }); // Default to original if invalid
          return;
        }
        set({ soundTheme: theme });
      },
      
      setVibrationEnabled: (enabled: boolean) => {
        set({ vibrationEnabled: enabled });
      },
      
      resetSettings: () => {
        set({
          gameSpeed: 'auto',
          soundEnabled: true,
          soundTheme: 'original',
          vibrationEnabled: true,
        });
      },
    }),
    {
      name: 'simon-settings',
    }
  )
);

