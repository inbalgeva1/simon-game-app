/**
 * Waiting Room / Game Page
 * 
 * Combined page that shows:
 * - Waiting room before game starts
 * - Simon game board during gameplay
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSimonStore } from '../store/simonStore';
import { socketService } from '../services/socketService';
import { SimonBoard } from '../components/game/SimonBoard';

export function WaitingRoomPage() {
  const { session } = useAuthStore();
  const gameCode = session?.gameCode;
  const playerId = session?.playerId;
  
  const { 
    isGameActive, 
    currentSequence, 
    currentRound, 
    isShowingSequence, 
    message,
    initializeListeners,
    cleanup,
  } = useSimonStore();
  
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'countdown' | 'active'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  
  // Initialize on mount
  useEffect(() => {
    console.log('🎮 WaitingRoomPage mounted');
    
    // Initialize Simon listeners
    initializeListeners();
    
    // Connect socket
    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ No socket connection');
      return;
    }
    
    // Join room via socket
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    // Listen for room state
    socket.on('room_state', (room: any) => {
      console.log('📦 Room state:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    // Listen for countdown
    socket.on('countdown', (data: { count: number }) => {
      console.log('⏳ Countdown:', data.count);
      setRoomStatus('countdown');
      setCountdownValue(data.count);
      
      if (data.count === 0) {
        setRoomStatus('active');
        setCountdownValue(null);
      }
    });
    
    // Listen for player joined
    socket.on('player_joined', (player: any) => {
      console.log('👋 Player joined:', player);
      setPlayers(prev => [...prev, player]);
    });
    
    // Cleanup on unmount
    return () => {
      cleanup();
      socket.off('room_state');
      socket.off('countdown');
      socket.off('player_joined');
    };
  }, [gameCode, playerId, initializeListeners, cleanup]);
  
  // Handle start game (host only)
  const handleStartGame = () => {
    const socket = socketService.getSocket();
    if (!socket || !gameCode || !playerId) return;
    
    socket.emit('start_game', { gameCode, playerId });
  };
  
  // Render game board if active
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Game Code Display */}
          <div className="text-center mb-4">
            <p className="text-white/70 text-sm">Game Code: <span className="font-mono font-bold">{gameCode}</span></p>
          </div>
          
          {/* Simon Board */}
          <SimonBoard
            sequence={currentSequence}
            round={currentRound}
            isShowingSequence={isShowingSequence}
            disabled={true} // Step 1: no input yet
          />
          
          {/* Message Display */}
          <div className="mt-6 text-center">
            <p className="text-white text-lg font-medium">{message}</p>
          </div>
          
          {/* Players Status */}
          <div className="mt-8 bg-white/10 backdrop-blur rounded-2xl p-4">
            <h3 className="text-white font-bold mb-2">Players</h3>
            <div className="grid grid-cols-2 gap-2">
              {players.map(player => (
                <div key={player.id} className="text-white/80 text-sm">
                  {player.displayName} {player.isHost && '👑'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-white mb-4">{countdownValue}</h1>
          <p className="text-2xl text-white/80">Get ready!</p>
        </div>
      </div>
    );
  }
  
  // Render waiting room
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Waiting Room</h1>
        <p className="text-center text-gray-600 mb-8">
          Game Code: <span className="font-mono font-bold text-lg">{gameCode}</span>
        </p>
        
        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Players ({players.length})</h2>
          <div className="space-y-2">
            {players.map(player => (
              <div 
                key={player.id} 
                className="bg-gray-100 rounded-lg p-3 flex items-center justify-between"
              >
                <span className="font-medium">
                  {player.displayName}
                  {player.id === playerId && ' (You)'}
                </span>
                {player.isHost && <span className="text-yellow-500">👑 Host</span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Start Button (host only) */}
        {isHost && (
          <button
            onClick={handleStartGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Start Game
          </button>
        )}
        
        {!isHost && (
          <p className="text-center text-gray-500">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
