/**
 * Simon Game Store
 * 
 * Manages Simon game state and WebSocket event handling.
 */

import { create } from 'zustand';
import type { Color, SimonGameState } from '../shared/types';
import { socketService } from '../services/socketService';

// =============================================================================
// TYPES
// =============================================================================

interface SimonStore {
  // Game state
  gameState: SimonGameState | null;
  isShowingSequence: boolean;
  currentSequence: Color[];
  currentRound: number;
  
  // UI state
  message: string;
  isGameActive: boolean;
  
  // Actions
  initializeListeners: () => void;
  cleanup: () => void;
  resetGame: () => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useSimonStore = create<SimonStore>((set) => ({
  // Initial state
  gameState: null,
  isShowingSequence: false,
  currentSequence: [],
  currentRound: 1,
  message: 'Waiting for game to start...',
  isGameActive: false,
  
  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  
  /**
   * Initialize WebSocket listeners for Simon events
   */
  initializeListeners: () => {
    console.log('🎮 Initializing Simon listeners');
    
    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ No socket connection');
      return;
    }
    
    // Listen for sequence display
    socket.on('simon:show_sequence', (data: { round: number; sequence: Color[] }) => {
      console.log('🎨 Received show_sequence:', data);
      
      set({
        currentRound: data.round,
        currentSequence: data.sequence,
        isShowingSequence: true,
        message: `Round ${data.round} - Watch the sequence!`,
        isGameActive: true,
      });
    });
    
    // Listen for sequence complete
    socket.on('simon:sequence_complete', () => {
      console.log('✅ Sequence complete');
      
      set({
        isShowingSequence: false,
        message: 'Sequence complete! Next round coming...',
      });
    });
    
    // Listen for game finished
    socket.on('simon:game_finished', (data: { winnerId: string; winnerName: string; finalRound: number }) => {
      console.log('🏆 Game finished:', data);
      
      set({
        isShowingSequence: false,
        isGameActive: false,
        message: `Game Over! Winner: ${data.winnerName} (Round ${data.finalRound})`,
      });
    });
    
    // Listen for player eliminated (Step 4)
    socket.on('simon:player_eliminated', (data: { playerId: string; playerName: string; reason: string }) => {
      console.log('💀 Player eliminated:', data);
      
      set({
        message: `${data.playerName} eliminated: ${data.reason}`,
      });
    });
    
    // Listen for input correct (Step 2)
    socket.on('simon:input_correct', (data: { playerId: string; index: number }) => {
      console.log('✅ Input correct:', data);
    });
  },
  
  /**
   * Cleanup listeners
   */
  cleanup: () => {
    console.log('🧹 Cleaning up Simon listeners');
    
    const socket = socketService.getSocket();
    if (!socket) return;
    
    socket.off('simon:show_sequence');
    socket.off('simon:sequence_complete');
    socket.off('simon:game_finished');
    socket.off('simon:player_eliminated');
    socket.off('simon:input_correct');
    
    // Reset state
    set({
      gameState: null,
      isShowingSequence: false,
      currentSequence: [],
      currentRound: 1,
      message: 'Waiting for game to start...',
      isGameActive: false,
    });
  },
  
  /**
   * Reset game state
   */
  resetGame: () => {
    set({
      gameState: null,
      isShowingSequence: false,
      currentSequence: [],
      currentRound: 1,
      message: 'Waiting for game to start...',
      isGameActive: false,
    });
  },
}));
