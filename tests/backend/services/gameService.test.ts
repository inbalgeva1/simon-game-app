/**
 * GameService Tests
 * 
 * TDD tests for the core game service.
 * Following Red-Green-Refactor methodology.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '../../../src/backend/services/gameService';
import type { PlayerInfo } from '../../../src/shared/types';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  // ===========================================================================
  // ROOM CREATION
  // ===========================================================================

  describe('createRoom', () => {
    const hostInfo: PlayerInfo = {
      displayName: 'Alice',
      avatarId: '1',
    };

    it('should create a room with a 6-character uppercase alphanumeric code', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.gameCode).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should set the creator as host', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.players).toHaveLength(1);
      expect(room.players[0].isHost).toBe(true);
    });

    it('should initialize room status as waiting', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.status).toBe('waiting');
    });

    it('should set player display name and avatar', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.players[0].displayName).toBe('Alice');
      expect(room.players[0].avatarId).toBe('1');
    });

    it('should generate unique player ID', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.players[0].id).toBeDefined();
      expect(room.players[0].id.length).toBeGreaterThan(0);
    });

    it('should initialize player as disconnected (no socket yet)', () => {
      const room = gameService.createRoom(hostInfo);
      
      expect(room.players[0].connected).toBe(false);
      expect(room.players[0].socketId).toBeNull();
    });

    it('should generate unique game codes for multiple rooms', () => {
      const room1 = gameService.createRoom(hostInfo);
      const room2 = gameService.createRoom(hostInfo);
      const room3 = gameService.createRoom(hostInfo);
      
      const codes = [room1.gameCode, room2.gameCode, room3.gameCode];
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(3);
    });
  });

  // ===========================================================================
  // ROOM RETRIEVAL
  // ===========================================================================

  describe('getRoom', () => {
    it('should return the room when it exists', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const created = gameService.createRoom(hostInfo);
      
      const retrieved = gameService.getRoom(created.gameCode);
      
      expect(retrieved).toBe(created);
    });

    it('should return null when room does not exist', () => {
      const retrieved = gameService.getRoom('NONEXISTENT');
      
      expect(retrieved).toBeNull();
    });
  });

  // ===========================================================================
  // JOINING ROOMS
  // ===========================================================================

  describe('joinRoom', () => {
    let gameCode: string;

    beforeEach(() => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      gameCode = room.gameCode;
    });

    it('should add a player to the room', () => {
      const playerInfo: PlayerInfo = { displayName: 'Bob', avatarId: '2' };
      
      const room = gameService.joinRoom(gameCode, playerInfo);
      
      expect(room.players).toHaveLength(2);
    });

    it('should not set joining player as host', () => {
      const playerInfo: PlayerInfo = { displayName: 'Bob', avatarId: '2' };
      
      const room = gameService.joinRoom(gameCode, playerInfo);
      
      expect(room.players[1].isHost).toBe(false);
    });

    it('should throw error when room does not exist', () => {
      const playerInfo: PlayerInfo = { displayName: 'Bob', avatarId: '2' };
      
      expect(() => gameService.joinRoom('NONEXISTENT', playerInfo))
        .toThrow('Room not found');
    });

    it('should throw error when room is full (4 players)', () => {
      // Add 3 more players to fill the room
      gameService.joinRoom(gameCode, { displayName: 'Bob', avatarId: '2' });
      gameService.joinRoom(gameCode, { displayName: 'Charlie', avatarId: '3' });
      gameService.joinRoom(gameCode, { displayName: 'Diana', avatarId: '4' });
      
      // 5th player should fail
      expect(() => gameService.joinRoom(gameCode, { displayName: 'Eve', avatarId: '5' }))
        .toThrow('Room is full');
    });

    it('should throw error when game is in progress', () => {
      gameService.updateRoomStatus(gameCode, 'active');
      const playerInfo: PlayerInfo = { displayName: 'Bob', avatarId: '2' };
      
      expect(() => gameService.joinRoom(gameCode, playerInfo))
        .toThrow('Game already in progress');
    });
  });

  // ===========================================================================
  // SOCKET MANAGEMENT
  // ===========================================================================

  describe('updateSocketId', () => {
    it('should update player socket ID and mark as connected', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      const playerId = room.players[0].id;
      
      const updated = gameService.updateSocketId(room.gameCode, playerId, 'socket-123');
      
      expect(updated?.players[0].socketId).toBe('socket-123');
      expect(updated?.players[0].connected).toBe(true);
    });

    it('should return null if room does not exist', () => {
      const result = gameService.updateSocketId('NONEXISTENT', 'player-id', 'socket-123');
      
      expect(result).toBeNull();
    });

    it('should return null if player does not exist', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      
      const result = gameService.updateSocketId(room.gameCode, 'wrong-player-id', 'socket-123');
      
      expect(result).toBeNull();
    });
  });

  describe('markPlayerDisconnected', () => {
    it('should mark player as disconnected and clear socket ID', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      const playerId = room.players[0].id;
      
      // First connect the player
      gameService.updateSocketId(room.gameCode, playerId, 'socket-123');
      
      // Then disconnect
      gameService.markPlayerDisconnected(room.gameCode, playerId);
      
      const player = gameService.getPlayer(room.gameCode, playerId);
      expect(player?.connected).toBe(false);
      expect(player?.socketId).toBeNull();
    });
  });

  // ===========================================================================
  // PLAYER REMOVAL
  // ===========================================================================

  describe('removePlayer', () => {
    it('should remove player from room', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      const playerInfo: PlayerInfo = { displayName: 'Bob', avatarId: '2' };
      gameService.joinRoom(room.gameCode, playerInfo);
      
      const bobId = room.players[1].id;
      const removed = gameService.removePlayer(room.gameCode, bobId);
      
      expect(removed).toBe(true);
      expect(gameService.getRoom(room.gameCode)?.players).toHaveLength(1);
    });

    it('should delete room when last player leaves', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      const playerId = room.players[0].id;
      
      gameService.removePlayer(room.gameCode, playerId);
      
      expect(gameService.getRoom(room.gameCode)).toBeNull();
    });

    it('should transfer host to next player when host leaves', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      gameService.joinRoom(room.gameCode, { displayName: 'Bob', avatarId: '2' });
      
      const aliceId = room.players[0].id;
      gameService.removePlayer(room.gameCode, aliceId);
      
      const updatedRoom = gameService.getRoom(room.gameCode);
      expect(updatedRoom?.players[0].displayName).toBe('Bob');
      expect(updatedRoom?.players[0].isHost).toBe(true);
    });

    it('should return false when player does not exist', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      
      const removed = gameService.removePlayer(room.gameCode, 'nonexistent-id');
      
      expect(removed).toBe(false);
    });
  });

  // ===========================================================================
  // ROOM STATUS
  // ===========================================================================

  describe('updateRoomStatus', () => {
    it('should update room status', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      
      const updated = gameService.updateRoomStatus(room.gameCode, 'active');
      
      expect(updated?.status).toBe('active');
    });

    it('should return null if room does not exist', () => {
      const result = gameService.updateRoomStatus('NONEXISTENT', 'active');
      
      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  describe('cleanupDeadRooms', () => {
    it('should remove empty rooms', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      const room = gameService.createRoom(hostInfo);
      
      // Remove the only player
      gameService.removePlayer(room.gameCode, room.players[0].id);
      
      // Room should already be deleted by removePlayer
      expect(gameService.getRoom(room.gameCode)).toBeNull();
    });

    it('should return count of cleaned rooms', () => {
      // Create some rooms - cleanup won't remove them immediately
      // since they're not old enough or all disconnected long enough
      const cleaned = gameService.cleanupDeadRooms();
      
      expect(typeof cleaned).toBe('number');
    });
  });

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  describe('getRoomCount', () => {
    it('should return 0 when no rooms exist', () => {
      expect(gameService.getRoomCount()).toBe(0);
    });

    it('should return correct count of rooms', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      gameService.createRoom(hostInfo);
      gameService.createRoom(hostInfo);
      gameService.createRoom(hostInfo);
      
      expect(gameService.getRoomCount()).toBe(3);
    });
  });

  describe('clearAllRooms', () => {
    it('should remove all rooms', () => {
      const hostInfo: PlayerInfo = { displayName: 'Alice', avatarId: '1' };
      gameService.createRoom(hostInfo);
      gameService.createRoom(hostInfo);
      
      gameService.clearAllRooms();
      
      expect(gameService.getRoomCount()).toBe(0);
    });
  });
});
