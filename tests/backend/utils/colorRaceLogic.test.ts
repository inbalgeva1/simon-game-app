/**
 * Color Race Logic Tests
 * 
 * TDD tests for the Color Race game logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeColorRaceGame,
  getRandomColor,
  validateAnswer,
  processRound,
  determineWinner,
  getLeaderboard,
} from '../../../src/backend/utils/colorRaceLogic';
import type { Player } from '../../../src/shared/types';
import type { ColorRaceGameState, PlayerAnswer } from '../../../src/shared/types';

describe('Color Race Logic', () => {
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  describe('initializeColorRaceGame', () => {
    const mockPlayers: Player[] = [
      { id: 'player-1', displayName: 'Alice', avatarId: '1', isHost: true, socketId: null, connected: true, lastActivity: new Date() },
      { id: 'player-2', displayName: 'Bob', avatarId: '2', isHost: false, socketId: null, connected: true, lastActivity: new Date() },
    ];

    it('should initialize scores to 0 for all players', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(state.scores['player-1']).toBe(0);
      expect(state.scores['player-2']).toBe(0);
    });

    it('should set initial round to 1', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(state.round).toBe(1);
    });

    it('should set phase to showing_color', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(state.phase).toBe('showing_color');
    });

    it('should set a random current color', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(['red', 'blue', 'yellow', 'green']).toContain(state.currentColor);
    });

    it('should set total rounds to 5', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(state.totalRounds).toBe(5);
    });

    it('should set gameType to color_race', () => {
      const state = initializeColorRaceGame(mockPlayers);
      
      expect(state.gameType).toBe('color_race');
    });
  });

  // ===========================================================================
  // RANDOM COLOR
  // ===========================================================================

  describe('getRandomColor', () => {
    it('should return a valid color', () => {
      const color = getRandomColor();
      
      expect(['red', 'blue', 'yellow', 'green']).toContain(color);
    });

    it('should return different colors over multiple calls (statistical)', () => {
      const colors = new Set<string>();
      
      // Call 100 times - should get at least 2 different colors
      for (let i = 0; i < 100; i++) {
        colors.add(getRandomColor());
      }
      
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  // ===========================================================================
  // ANSWER VALIDATION
  // ===========================================================================

  describe('validateAnswer', () => {
    it('should return true for correct color', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'showing_color',
        currentColor: 'red',
        round: 1,
        totalRounds: 5,
        scores: { 'player-1': 0 },
        roundWinner: null,
      };
      
      const answer: PlayerAnswer = {
        playerId: 'player-1',
        color: 'red',
        timestamp: Date.now(),
      };
      
      expect(validateAnswer(gameState, answer)).toBe(true);
    });

    it('should return false for wrong color', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'showing_color',
        currentColor: 'red',
        round: 1,
        totalRounds: 5,
        scores: { 'player-1': 0 },
        roundWinner: null,
      };
      
      const answer: PlayerAnswer = {
        playerId: 'player-1',
        color: 'blue',
        timestamp: Date.now(),
      };
      
      expect(validateAnswer(gameState, answer)).toBe(false);
    });
  });

  // ===========================================================================
  // ROUND PROCESSING
  // ===========================================================================

  describe('processRound', () => {
    let baseGameState: ColorRaceGameState;

    beforeEach(() => {
      baseGameState = {
        gameType: 'color_race',
        phase: 'showing_color',
        currentColor: 'red',
        round: 1,
        totalRounds: 5,
        scores: { 'player-1': 0, 'player-2': 0 },
        roundWinner: null,
      };
    });

    it('should award point to fastest correct answer', () => {
      const answers: PlayerAnswer[] = [
        { playerId: 'player-1', color: 'red', timestamp: 1000 },
        { playerId: 'player-2', color: 'red', timestamp: 1500 },
      ];
      
      const newState = processRound(baseGameState, answers);
      
      expect(newState.scores['player-1']).toBe(1);
      expect(newState.scores['player-2']).toBe(0);
    });

    it('should set round winner to fastest player', () => {
      const answers: PlayerAnswer[] = [
        { playerId: 'player-2', color: 'red', timestamp: 1000 },
        { playerId: 'player-1', color: 'red', timestamp: 2000 },
      ];
      
      const newState = processRound(baseGameState, answers);
      
      expect(newState.roundWinner).toBe('player-2');
    });

    it('should advance to next round if not last round', () => {
      const answers: PlayerAnswer[] = [
        { playerId: 'player-1', color: 'red', timestamp: 1000 },
      ];
      
      const newState = processRound(baseGameState, answers);
      
      expect(newState.round).toBe(2);
      expect(newState.phase).toBe('showing_color');
    });

    it('should finish game on last round', () => {
      const lastRoundState: ColorRaceGameState = {
        ...baseGameState,
        round: 5,
      };
      
      const answers: PlayerAnswer[] = [
        { playerId: 'player-1', color: 'red', timestamp: 1000 },
      ];
      
      const newState = processRound(lastRoundState, answers);
      
      expect(newState.phase).toBe('finished');
    });

    it('should not award points if no correct answers', () => {
      const answers: PlayerAnswer[] = [
        { playerId: 'player-1', color: 'blue', timestamp: 1000 },
        { playerId: 'player-2', color: 'green', timestamp: 1500 },
      ];
      
      const newState = processRound(baseGameState, answers);
      
      expect(newState.scores['player-1']).toBe(0);
      expect(newState.scores['player-2']).toBe(0);
      expect(newState.roundWinner).toBeNull();
    });

    it('should ignore wrong answers when determining winner', () => {
      const answers: PlayerAnswer[] = [
        { playerId: 'player-1', color: 'blue', timestamp: 500 },  // Wrong but faster
        { playerId: 'player-2', color: 'red', timestamp: 1000 },  // Correct but slower
      ];
      
      const newState = processRound(baseGameState, answers);
      
      expect(newState.scores['player-2']).toBe(1);
      expect(newState.roundWinner).toBe('player-2');
    });
  });

  // ===========================================================================
  // WINNER DETERMINATION
  // ===========================================================================

  describe('determineWinner', () => {
    it('should return player with highest score', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'finished',
        currentColor: null,
        round: 5,
        totalRounds: 5,
        scores: { 'player-1': 3, 'player-2': 2 },
        roundWinner: null,
      };
      
      const winner = determineWinner(gameState);
      
      expect(winner?.winnerId).toBe('player-1');
      expect(winner?.winnerScore).toBe(3);
    });

    it('should return null if no players', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'finished',
        currentColor: null,
        round: 5,
        totalRounds: 5,
        scores: {},
        roundWinner: null,
      };
      
      const winner = determineWinner(gameState);
      
      expect(winner).toBeNull();
    });

    it('should return first player in case of tie', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'finished',
        currentColor: null,
        round: 5,
        totalRounds: 5,
        scores: { 'player-1': 2, 'player-2': 2 },
        roundWinner: null,
      };
      
      const winner = determineWinner(gameState);
      
      // Should return one of them (first encountered)
      expect(['player-1', 'player-2']).toContain(winner?.winnerId);
      expect(winner?.winnerScore).toBe(2);
    });
  });

  // ===========================================================================
  // LEADERBOARD
  // ===========================================================================

  describe('getLeaderboard', () => {
    it('should sort players by score descending', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'finished',
        currentColor: null,
        round: 5,
        totalRounds: 5,
        scores: { 'player-1': 1, 'player-2': 3, 'player-3': 2 },
        roundWinner: null,
      };
      
      const leaderboard = getLeaderboard(gameState);
      
      expect(leaderboard[0].playerId).toBe('player-2');
      expect(leaderboard[0].score).toBe(3);
      expect(leaderboard[1].playerId).toBe('player-3');
      expect(leaderboard[2].playerId).toBe('player-1');
    });

    it('should assign correct ranks', () => {
      const gameState: ColorRaceGameState = {
        gameType: 'color_race',
        phase: 'finished',
        currentColor: null,
        round: 5,
        totalRounds: 5,
        scores: { 'player-1': 1, 'player-2': 3 },
        roundWinner: null,
      };
      
      const leaderboard = getLeaderboard(gameState);
      
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].rank).toBe(2);
    });
  });
});
