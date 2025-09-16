import type * as Party from "partykit/server";

// Game state types
interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswer?: string;
  joinedAt: number;
  isHost?: boolean;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

interface GameState {
  phase: "lobby" | "question" | "results" | "finished";
  players: Map<string, Player>;
  currentQuestion?: Question;
  questionIndex: number;
  questionStartTime?: number;
  questionDuration: number; // in milliseconds
  questions: Question[];
  answers: Map<string, number>; // playerId -> selectedOption
  finalRankings?: Player[]; // Frozen rankings when game ends
}

// Message types for client communication
type ClientMessage = 
  | { type: "join"; name: string }
  | { type: "answer"; option: number }
  | { type: "emoji"; emoji: string }
  | { type: "cursor"; x: number; y: number }
  | { type: "start_game" }
  | { type: "next_question" }
  | { type: "reset_game" };

type ServerMessage =
  | { type: "game_state"; state: Partial<GameState> }
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; playerId: string }
  | { type: "question_start"; question: Omit<Question, "correctAnswer">; timeRemaining: number }
  | { type: "question_end"; correctAnswer: number; playerAnswers: Array<{playerId: string, answer: number}> }
  | { type: "leaderboard"; players: Player[] }
  | { type: "emoji"; playerId: string; emoji: string }
  | { type: "cursor"; playerId: string; x: number; y: number }
  | { type: "error"; message: string };

export default class QuizGameServer implements Party.Server {
  private gameState: GameState;
  private questionTimer?: NodeJS.Timeout;

  constructor(readonly room: Party.Room) {
    // Initialize game state
    this.gameState = {
      phase: "lobby",
      players: new Map(),
      questionIndex: 0,
      questionDuration: 15000, // 15 seconds per question
      questions: [],
      answers: new Map()
    };

    // Load quiz content on startup
    this.loadQuizContent();
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`New connection: ${conn.id}`);
    
    // Send current game state to new connection
    this.sendToConnection(conn, {
      type: "game_state",
      state: {
        phase: this.gameState.phase,
        players: Array.from(this.gameState.players.values()),
        questionIndex: this.gameState.questionIndex,
        questionDuration: this.gameState.questionDuration
      }
    });
    
    // Send leaderboard (will use frozen rankings if game is finished)
    this.sendLeaderboardToConnection(conn);
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data: ClientMessage = JSON.parse(message);
      
      switch (data.type) {
        case "join":
          this.handlePlayerJoin(sender, data.name);
          break;
          
        case "answer":
          this.handlePlayerAnswer(sender.id, data.option);
          break;
          
        case "emoji":
          this.handleEmojiReaction(sender.id, data.emoji);
          break;
          
        case "cursor":
          this.handleCursorMove(sender.id, data.x, data.y);
          break;
          
        case "start_game":
          this.startGame();
          break;
          
        case "next_question":
          this.nextQuestion();
          break;
          
        case "reset_game":
          this.handleGameReset(sender.id);
          break;
          
        default:
          this.sendToConnection(sender, {
            type: "error",
            message: "Unknown message type"
          });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      this.sendToConnection(sender, {
        type: "error", 
        message: "Invalid message format"
      });
    }
  }

  async onClose(connection: Party.Connection) {
    console.log(`Connection closed: ${connection.id}`);
    this.handlePlayerLeave(connection.id);
  }

  // Handle HTTP requests with CORS
  async onRequest(request: Party.Request): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Handle other HTTP requests
    return new Response("PartyKit Quiz Game Server", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain",
      },
    });
  }

  private async loadQuizContent() {
    try {
      // Load LinearB GTM quiz questions from JSON file
      this.gameState.questions = await this.getLinearBQuestions();
    } catch (error) {
      console.error("Error loading quiz content:", error);
      // Fallback to basic questions if something goes wrong
      this.gameState.questions = await this.getDefaultQuestions();
    }
  }

  private async getLinearBQuestions(): Promise<Question[]> {
    try {
      // Load questions from LinearB GTM quiz JSON file
      const response = await fetch('https://raw.githubusercontent.com/azigler/partykit-quiz-game/main/content/linearb-gtm-quiz.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }
      
      const quizData = await response.json();
      
      // Transform the JSON structure to match our Question interface
      return quizData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        category: q.category,
        difficulty: q.difficulty,
        points: q.points
      }));
    } catch (error) {
      console.error('Error loading LinearB GTM quiz:', error);
      throw error; // Re-throw to trigger fallback
    }
  }

  private async getDefaultQuestions(): Promise<Question[]> {
    // Minimal fallback questions
    return [
      {
        id: "fallback-001",
        question: "What is the primary goal of measuring AI effectiveness in engineering teams?",
        options: [
          "To justify the cost of AI tools",
          "To understand if teams are shipping more value with fewer mistakes",
          "To compare different AI tools",
          "To track developer productivity"
        ],
        correctAnswer: 1,
        category: "Basic Concepts",
        difficulty: "easy",
        points: 5
      }
    ];
  }

  private handlePlayerJoin(connection: Party.Connection, name: string) {
    const trimmedName = name.trim();
    const isHost = trimmedName === 'AZ';
    
    const player: Player = {
      id: connection.id,
      name: trimmedName,
      score: 0,
      joinedAt: Date.now(),
      isHost
    };

    this.gameState.players.set(connection.id, player);

    // Notify all players about new player
    this.broadcast({
      type: "player_joined",
      player
    });

    // Send updated leaderboard
    this.sendLeaderboard();
  }

  private handlePlayerLeave(playerId: string) {
    if (this.gameState.players.has(playerId)) {
      // Remove player from game
      this.gameState.players.delete(playerId);
      this.gameState.answers.delete(playerId);

      this.broadcast({
        type: "player_left",
        playerId
      });

      // Check if no players left - reset game to lobby
      if (this.gameState.players.size === 0) {
        console.log("All players left, resetting game to lobby");
        this.resetGameToLobby();
      } else {
        this.sendLeaderboard();
        
        // If we're in a question phase and all remaining players have answered, end question
        if (this.gameState.phase === "question" && this.gameState.currentQuestion) {
          const activePlayers = Array.from(this.gameState.players.values());
          const answeredCount = this.gameState.answers.size;
          
          if (activePlayers.length > 0 && answeredCount === activePlayers.length) {
            this.endCurrentQuestion();
          }
        }
      }
    }
  }

  private handlePlayerAnswer(playerId: string, option: number) {
    if (this.gameState.phase !== "question" || !this.gameState.currentQuestion) {
      return;
    }

    const player = this.gameState.players.get(playerId);
    if (!player) return;

    // Record the answer
    this.gameState.answers.set(playerId, option);
    player.currentAnswer = option.toString();

    // Check if all players have answered
    const activePlayers = Array.from(this.gameState.players.values());
    const answeredCount = this.gameState.answers.size;

    if (answeredCount === activePlayers.length) {
      // All players answered, end question early
      this.endCurrentQuestion();
    }
  }

  private handleEmojiReaction(playerId: string, emoji: string) {
    this.broadcast({
      type: "emoji",
      playerId,
      emoji
    });
  }

  private handleCursorMove(playerId: string, x: number, y: number) {
    this.broadcast({
      type: "cursor",
      playerId,
      x,
      y
    }, [playerId]); // Exclude sender
  }

  private startGame() {
    if (this.gameState.phase !== "lobby" || this.gameState.questions.length === 0) {
      return;
    }

    this.gameState.phase = "question";
    this.gameState.questionIndex = 0;
    this.nextQuestion();
  }

  private nextQuestion() {
    if (this.gameState.questionIndex >= this.gameState.questions.length) {
      this.endGame();
      return;
    }

    this.gameState.phase = "question";
    this.gameState.currentQuestion = this.gameState.questions[this.gameState.questionIndex];
    this.gameState.questionStartTime = Date.now();
    this.gameState.answers.clear();

    // Clear previous answers from players
    this.gameState.players.forEach(player => {
      player.currentAnswer = undefined;
    });

    // Send question to all players (without correct answer)
    const questionForClient = {
      id: this.gameState.currentQuestion.id,
      question: this.gameState.currentQuestion.question,
      options: this.gameState.currentQuestion.options,
      category: this.gameState.currentQuestion.category,
      difficulty: this.gameState.currentQuestion.difficulty,
      points: this.gameState.currentQuestion.points
    };

    this.broadcast({
      type: "question_start",
      question: questionForClient,
      timeRemaining: this.gameState.questionDuration
    });

    // Set timer for question end
    this.questionTimer = setTimeout(() => {
      this.endCurrentQuestion();
    }, this.gameState.questionDuration);
  }

  private endCurrentQuestion() {
    if (!this.gameState.currentQuestion || this.gameState.phase !== "question") {
      return;
    }

    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
    }

    this.gameState.phase = "results";

    // Calculate scores
    const correctAnswer = this.gameState.currentQuestion.correctAnswer;
    const points = this.gameState.currentQuestion.points;
    const playerAnswers: Array<{playerId: string, answer: number}> = [];

    this.gameState.answers.forEach((answer, playerId) => {
      const player = this.gameState.players.get(playerId);
      if (player) {
        playerAnswers.push({ playerId, answer });
        
        if (answer === correctAnswer) {
          player.score += points;
        }
      }
    });

    // Send results to all players
    this.broadcast({
      type: "question_end",
      correctAnswer,
      playerAnswers
    });

    // Send updated leaderboard
    this.sendLeaderboard();

    // Move to next question after a shorter delay for faster pace
    setTimeout(() => {
      this.gameState.questionIndex++;
      this.nextQuestion();
    }, 2000); // 2 second delay to show results
  }

  private endGame() {
    this.gameState.phase = "finished";
    
    // Freeze the final rankings at the moment the game ends
    this.gameState.finalRankings = Array.from(this.gameState.players.values())
      .sort((a, b) => b.score - a.score);
    
    this.broadcast({
      type: "game_state",
      state: { phase: "finished" }
    });

    this.sendLeaderboard();
  }

  private handleGameReset(playerId: string) {
    const player = this.gameState.players.get(playerId);
    
    // Only allow hosts to reset the game
    if (!player || !player.isHost) {
      console.log(`Non-host player ${playerId} attempted to reset game`);
      return;
    }
    
    console.log(`Host ${player.name} is resetting the game`);
    this.resetGameToLobby();
    
    // Broadcast game reset to all connected players
    this.broadcast({
      type: "game_state",
      state: {
        phase: "lobby",
        players: [],
        questionIndex: 0,
        questionDuration: 15000
      }
    });
  }

  private resetGameToLobby() {
    // Clear any running question timer
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = undefined;
    }

    // Reset game state to initial lobby state
    this.gameState = {
      phase: "lobby",
      players: new Map(),
      questionIndex: 0,
      questionDuration: 15000, // 15 seconds per question
      questions: this.gameState.questions, // Keep the loaded questions
      answers: new Map(),
      finalRankings: undefined,
      currentQuestion: undefined,
      questionStartTime: undefined
    };

    console.log("Game reset to lobby - ready for new players");
  }

  private sendLeaderboard() {
    // Use frozen rankings if game is finished, otherwise calculate from current players
    const sortedPlayers = this.gameState.finalRankings || 
      Array.from(this.gameState.players.values()).sort((a, b) => b.score - a.score);

    this.broadcast({
      type: "leaderboard",
      players: sortedPlayers
    });
  }

  private broadcast(message: ServerMessage, exclude: string[] = []) {
    this.room.broadcast(JSON.stringify(message), exclude);
  }

  private sendToConnection(connection: Party.Connection, message: ServerMessage) {
    connection.send(JSON.stringify(message));
  }

  private sendLeaderboardToConnection(connection: Party.Connection) {
    // Use frozen rankings if game is finished, otherwise calculate from current players
    const sortedPlayers = this.gameState.finalRankings || 
      Array.from(this.gameState.players.values()).sort((a, b) => b.score - a.score);

    this.sendToConnection(connection, {
      type: "leaderboard",
      players: sortedPlayers
    });
  }
}
