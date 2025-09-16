import type * as Party from "partykit/server";

// Game state types
interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswer?: string;
  joinedAt: number;
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
  | { type: "next_question" };

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
      // Load LinearB AI Measurement Framework questions directly
      this.gameState.questions = await this.getLinearBQuestions();
    } catch (error) {
      console.error("Error loading quiz content:", error);
      // Fallback to basic questions if something goes wrong
      this.gameState.questions = await this.getDefaultQuestions();
    }
  }

  private async getLinearBQuestions(): Promise<Question[]> {
    // LinearB AI Measurement Framework questions based on their sales deck
    return [
      {
        id: "lb-001",
        question: "According to LinearB's philosophy, what are the 'true signals' for measuring AI effectiveness?",
        options: [
          "Lines of code generated and time saved",
          "Throughput and quality",
          "Developer satisfaction and tool adoption rates",
          "Cost reduction and velocity improvements"
        ],
        correctAnswer: 1,
        category: "Philosophy",
        difficulty: "easy",
        points: 5
      },
      {
        id: "lb-002",
        question: "LinearB defines AI ROI as which of the following?",
        options: [
          "Time saved in hours multiplied by developer salary costs",
          "Features shipped, bugs avoided, and developer energy focused on high-leverage work",
          "Lines of code generated per developer per sprint",
          "Reduced hiring needs due to increased productivity"
        ],
        correctAnswer: 1,
        category: "ROI Definition",
        difficulty: "easy",
        points: 5
      },
      {
        id: "lb-003",
        question: "How does LinearB recommend thinking about AI adoption in your organization?",
        options: [
          "Count headcount of developers using AI tools",
          "Focus on mindsets across a spectrum from skeptical to embracing",
          "Measure percentage of code commits using AI",
          "Track monthly active users of AI tools"
        ],
        correctAnswer: 1,
        category: "Adoption Strategy",
        difficulty: "medium",
        points: 10
      },
      {
        id: "lb-004",
        question: "What does LinearB identify as the 'starting line' versus 'finish line' of AI adoption maturity?",
        options: [
          "Junior developers vs Senior developers using AI",
          "Low context, iterating on outputs vs High context, iterating on inputs",
          "Individual adoption vs Team-wide adoption",
          "Basic code completion vs Advanced code generation"
        ],
        correctAnswer: 1,
        category: "Maturity Model",
        difficulty: "hard",
        points: 15
      },
      {
        id: "lb-005",
        question: "Which metric does LinearB use to measure how refined a pull request is when initially submitted?",
        options: [
          "Code coverage percentage",
          "PR Maturity",
          "Review turnaround time",
          "Lines of code changed"
        ],
        correctAnswer: 1,
        category: "Quality Metrics",
        difficulty: "medium",
        points: 10
      },
      {
        id: "lb-006",
        question: "LinearB's 'Rework Rate' metric specifically measures what?",
        options: [
          "How often developers reject AI suggestions",
          "Changes to code modified within the last 21 days",
          "Time spent refactoring legacy code",
          "Percentage of PRs requiring multiple review cycles"
        ],
        correctAnswer: 1,
        category: "Quality Metrics",
        difficulty: "hard",
        points: 15
      },
      {
        id: "lb-007",
        question: "What is LinearB's unique differentiator for tracking AI-generated code?",
        options: [
          "Integration with all major AI coding tools",
          "Using gitStream to label AI-generated PRs at the source",
          "Real-time monitoring of developer productivity",
          "Automated surveys sent to developers"
        ],
        correctAnswer: 1,
        category: "Technical Approach",
        difficulty: "medium",
        points: 10
      },
      {
        id: "lb-008",
        question: "According to LinearB's framework, why is 'throughput alone ≠ value'?",
        options: [
          "Because faster development often leads to more bugs",
          "Because business impact isn't always correlated with code volume",
          "Because developers need work-life balance",
          "Because leadership prefers predictable delivery schedules"
        ],
        correctAnswer: 1,
        category: "Philosophy",
        difficulty: "medium",
        points: 10
      },
      {
        id: "lb-009",
        question: "What does LinearB recommend as the best methodology for measuring AI impact?",
        options: [
          "Before-and-after comparisons of team velocity",
          "Using gitStream to label and compare AI vs non-AI PRs",
          "Tracking story points completed per developer",
          "Measuring daily active users of AI tools"
        ],
        correctAnswer: 1,
        category: "Methodology",
        difficulty: "hard",
        points: 15
      },
      {
        id: "lb-010",
        question: "LinearB's framework combines quantitative data with qualitative insights. What's a key qualitative method?",
        options: [
          "Code quality automated analysis",
          "Developer surveys sent through Slack/Teams",
          "Automated PR review comments",
          "API data from AI tool providers"
        ],
        correctAnswer: 1,
        category: "Data Collection",
        difficulty: "easy",
        points: 5
      },
      {
        id: "lb-011",
        question: "When presenting AI effectiveness to leadership, LinearB recommends focusing on:",
        options: [
          "Time saved metrics and cost reduction spreadsheets",
          "Product momentum through features and quality",
          "Developer satisfaction scores and retention rates",
          "Technical metrics like code coverage and complexity"
        ],
        correctAnswer: 1,
        category: "Leadership Communication",
        difficulty: "medium",
        points: 10
      },
      {
        id: "lb-012",
        question: "According to LinearB, what characterizes the difference between junior and senior developer AI usage?",
        options: [
          "Seniors use more advanced AI tools than juniors",
          "Juniors iterate on outputs, seniors iterate on inputs",
          "Seniors are more skeptical of AI assistance",
          "Juniors generate more lines of code with AI"
        ],
        correctAnswer: 1,
        category: "Developer Maturity",
        difficulty: "hard",
        points: 15
      }
    ];
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
    const player: Player = {
      id: connection.id,
      name: name.trim(),
      score: 0,
      joinedAt: Date.now()
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
