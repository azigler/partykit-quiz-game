import { writable, derived } from 'svelte/store';
import PartySocket from 'partysocket';

// Types matching the backend
export interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswer?: string;
  joinedAt: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface GameState {
  phase: "lobby" | "question" | "results" | "finished";
  players: Player[];
  currentQuestion?: Question;
  questionIndex: number;
  questionDuration: number;
}

export type ServerMessage =
  | { type: "game_state"; state: Partial<GameState> }
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; playerId: string }
  | { type: "question_start"; question: Question; timeRemaining: number }
  | { type: "question_end"; correctAnswer: number; playerAnswers: Array<{playerId: string, answer: number}> }
  | { type: "leaderboard"; players: Player[] }
  | { type: "emoji"; playerId: string; emoji: string }
  | { type: "cursor"; playerId: string; x: number; y: number }
  | { type: "error"; message: string };

// Store state
export const connected = writable(false);
export const currentPlayer = writable<Player | null>(null);
export const gameState = writable<GameState>({
  phase: "lobby",
  players: [],
  questionIndex: 0,
  questionDuration: 15000
});

export const cursors = writable<Map<string, { x: number; y: number }>>(new Map());
export const recentEmojis = writable<Array<{ playerId: string; emoji: string; timestamp: number }>>([]);

// Question timer
export const timeRemaining = writable<number>(0);
export const questionResults = writable<{ correctAnswer: number; playerAnswers: Array<{playerId: string, answer: number}> } | null>(null);

// Final rankings (frozen when game ends)
export const finalRankings = writable<Player[]>([]);

// Derived stores
export const sortedPlayers = derived(gameState, ($gameState) => 
  [...$gameState.players].sort((a, b) => b.score - a.score)
);

export const isGameHost = derived([currentPlayer, gameState], ([$currentPlayer, $gameState]) => 
  $currentPlayer && $gameState.players[0]?.id === $currentPlayer.id
);

// Connection management
let socket: PartySocket | null = null;
let questionTimer: NodeJS.Timeout | null = null;
let myPlayerId: string | null = null;
let myPlayerName: string | null = null;

export const gameActions = {
  connect(roomId: string = 'default-lobby') {
    if (socket) {
      socket.close();
    }

    // In development, connect to local PartyKit server
    // In production, this would be your deployed PartyKit URL
    const host = import.meta.env.DEV ? '127.0.0.1:1999' : 'ai-vocab-quiz-game.azigler.partykit.dev';
    
    socket = new PartySocket({
      host,
      room: roomId,
      party: "main"
    });

    socket.addEventListener('open', () => {
      console.log('Connected to game server');
      connected.set(true);
    });

    socket.addEventListener('close', () => {
      console.log('Disconnected from game server');
      connected.set(false);
      if (questionTimer) {
        clearInterval(questionTimer);
        questionTimer = null;
      }
    });

    socket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (error) {
        console.error('Error parsing server message:', error);
      }
    });

    socket.addEventListener('error', (error) => {
      console.error('Socket error:', error);
    });
  },

  disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
    if (questionTimer) {
      clearInterval(questionTimer);
      questionTimer = null;
    }
    // Reset player tracking
    myPlayerId = null;
    myPlayerName = null;
    currentPlayer.set(null);
    connected.set(false);
  },

  joinGame(playerName: string) {
    if (!socket) return;
    // Store the name we're joining with to identify ourselves
    myPlayerName = playerName;
    socket.send(JSON.stringify({
      type: 'join',
      name: playerName
    }));
  },

  startGame() {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'start_game'
    }));
  },

  answerQuestion(option: number) {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'answer',
      option
    }));
  },

  sendEmoji(emoji: string) {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'emoji',
      emoji
    }));
  },

  sendCursor(x: number, y: number) {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'cursor',
      x,
      y
    }));
  }
};

function handleServerMessage(message: ServerMessage) {
  switch (message.type) {
    case 'game_state':
      let wasFinished = false;
      gameState.subscribe(state => {
        wasFinished = state.phase === 'finished';
      })();
      
      gameState.update(state => ({ ...state, ...message.state }));
      
      // Freeze rankings when game transitions to finished
      if (message.state.phase === 'finished' && !wasFinished) {
        if (message.state.players && message.state.players.length > 0) {
          const sortedFinalPlayers = [...message.state.players].sort((a, b) => b.score - a.score);
          finalRankings.set(sortedFinalPlayers);
          console.log('Frozen final rankings:', sortedFinalPlayers.map(p => `${p.name}: ${p.score}`));
        }
      }
      
      // If we receive existing players and we know our name, identify ourselves
      if (myPlayerName && !myPlayerId && message.state.players) {
        const myPlayer = message.state.players.find(p => p.name === myPlayerName);
        if (myPlayer) {
          myPlayerId = myPlayer.id;
          currentPlayer.set(myPlayer);
          console.log('Found existing player:', myPlayer.name, myPlayer.id);
        }
      }
      break;

    case 'player_joined':
      gameState.update(state => ({
        ...state,
        players: [...state.players, message.player]
      }));
      
      // Check if this is our player by matching name and we haven't set currentPlayer yet
      if (myPlayerName && message.player.name === myPlayerName && !myPlayerId) {
        myPlayerId = message.player.id;
        currentPlayer.set(message.player);
        console.log('Set current player:', message.player.name, message.player.id);
      }
      break;

    case 'player_left':
      gameState.update(state => ({
        ...state,
        players: state.players.filter(p => p.id !== message.playerId)
      }));
      cursors.update(map => {
        map.delete(message.playerId);
        return new Map(map);
      });
      break;

    case 'question_start':
      gameState.update(state => ({
        ...state,
        phase: "question",
        currentQuestion: message.question
      }));
      
      // Start countdown timer
      timeRemaining.set(message.timeRemaining);
      questionResults.set(null);
      
      if (questionTimer) clearInterval(questionTimer);
      questionTimer = setInterval(() => {
        timeRemaining.update(time => {
          const newTime = time - 100;
          if (newTime <= 0) {
            if (questionTimer) clearInterval(questionTimer);
            return 0;
          }
          return newTime;
        });
      }, 100);
      break;

    case 'question_end':
      if (questionTimer) {
        clearInterval(questionTimer);
        questionTimer = null;
      }
      gameState.update(state => ({ ...state, phase: "results" }));
      questionResults.set({
        correctAnswer: message.correctAnswer,
        playerAnswers: message.playerAnswers
      });
      timeRemaining.set(0);
      break;

    case 'leaderboard':
      gameState.update(state => ({
        ...state,
        players: message.players
      }));
      
      // Update current player if we have one
      if (myPlayerId) {
        const updatedPlayer = message.players.find(p => p.id === myPlayerId);
        if (updatedPlayer) {
          currentPlayer.set(updatedPlayer);
        }
      }
      break;

    case 'emoji':
      recentEmojis.update(emojis => {
        const newEmojis = [...emojis, {
          playerId: message.playerId,
          emoji: message.emoji,
          timestamp: Date.now()
        }];
        // Keep only recent emojis (last 5 seconds)
        const cutoff = Date.now() - 5000;
        return newEmojis.filter(e => e.timestamp > cutoff);
      });
      break;

    case 'cursor':
      cursors.update(map => {
        map.set(message.playerId, { x: message.x, y: message.y });
        return new Map(map);
      });
      break;

    case 'error':
      console.error('Server error:', message.message);
      break;

    default:
      console.warn('Unknown message type:', message);
  }
}

// Clean up old emojis periodically
setInterval(() => {
  recentEmojis.update(emojis => {
    const cutoff = Date.now() - 5000;
    return emojis.filter(e => e.timestamp > cutoff);
  });
}, 1000);
