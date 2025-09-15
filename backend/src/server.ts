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
      // Load quiz content from the JSON file
      const response = await fetch('https://raw.githubusercontent.com/azigler/partykit-quiz-game/main/content/ai-gtm-quiz.json');
      const quizData = await response.json();
      this.gameState.questions = quizData.questions;
    } catch (error) {
      console.error("Error loading quiz content from file:", error);
      // Fallback to default questions if file loading fails
      this.gameState.questions = await this.getDefaultQuestions();
    }
  }

  private async getDefaultQuestions(): Promise<Question[]> {
    // LinearB-focused questions for engineering managers
    return [
      {
        id: "em-001",
        question: "What is the most important metric to track when measuring AI coding tool adoption?",
        options: [
          "Number of developers who have installed the tool",
          "Percentage of code commits that used AI assistance",
          "Total time saved per developer per day",
          "Lines of AI-generated code accepted"
        ],
        correctAnswer: 2,
        category: "AI Measurement",
        difficulty: "easy",
        points: 5
      },
      {
        id: "em-002",
        question: "According to DORA metrics, what defines 'elite' deployment frequency?",
        options: [
          "Multiple times per day",
          "Once per day",
          "Once per week",
          "Once per month"
        ],
        correctAnswer: 0,
        category: "DevOps Metrics",
        difficulty: "medium",
        points: 10
      },
      {
        id: "em-003",
        question: "When implementing AI coding assistants, what's the biggest productivity risk?",
        options: [
          "Developers becoming too dependent on AI",
          "Security vulnerabilities in generated code",
          "Inconsistent code quality across the team",
          "Increased code review time"
        ],
        correctAnswer: 1,
        category: "Team Management",
        difficulty: "medium",
        points: 10
      },
      {
        id: "em-004",
        question: "What's the best way to measure ROI of AI coding tools for your engineering team?",
        options: [
          "Track story points completed per sprint",
          "Measure cycle time from code commit to production",
          "Count lines of code written per developer",
          "Monitor developer satisfaction scores"
        ],
        correctAnswer: 1,
        category: "ROI Measurement",
        difficulty: "hard",
        points: 15
      },
      {
        id: "em-005",
        question: "Which DORA metric is most likely to improve first when introducing AI coding assistants?",
        options: [
          "Deployment frequency",
          "Lead time for changes",
          "Mean time to recovery",
          "Change failure rate"
        ],
        correctAnswer: 1,
        category: "AI Impact",
        difficulty: "medium",
        points: 10
      },
      {
        id: "em-006",
        question: "What percentage of developers typically achieve measurable productivity gains from AI coding tools?",
        options: [
          "30-40%",
          "50-60%",
          "70-80%",
          "90%+"
        ],
        correctAnswer: 2,
        category: "Industry Benchmarks",
        difficulty: "easy",
        points: 5
      },
      {
        id: "em-007",
        question: "When rolling out AI tools, what's the most effective adoption strategy?",
        options: [
          "Mandate usage across all teams immediately",
          "Start with senior developers as early adopters",
          "Begin with junior developers to accelerate learning",
          "Let teams decide individually when to adopt"
        ],
        correctAnswer: 1,
        category: "Change Management",
        difficulty: "medium",
        points: 10
      },
      {
        id: "em-008",
        question: "What's a key indicator that AI tools are improving your team's code quality?",
        options: [
          "Fewer bugs found in production",
          "More consistent coding patterns across the team",
          "Reduced time spent in code review",
          "Higher test coverage percentages"
        ],
        correctAnswer: 0,
        category: "Quality Metrics",
        difficulty: "hard",
        points: 15
      },
      {
        id: "em-009",
        question: "Which developer experience metric is most correlated with team productivity?",
        options: [
          "Build success rate",
          "Time spent waiting for CI/CD pipelines",
          "Number of context switches per day",
          "Code review turnaround time"
        ],
        correctAnswer: 2,
        category: "Developer Experience",
        difficulty: "hard",
        points: 15
      },
      {
        id: "em-010",
        question: "What's the recommended approach for measuring AI tool impact on sprint velocity?",
        options: [
          "Compare story points before and after AI adoption",
          "Track actual time to complete similar tasks",
          "Monitor team confidence in estimates",
          "Measure features delivered per sprint"
        ],
        correctAnswer: 1,
        category: "Sprint Analytics",
        difficulty: "medium",
        points: 10
      },
      {
        id: "em-011",
        question: "What's the biggest challenge engineering managers face with AI tool adoption?",
        options: [
          "Getting budget approval for new tools",
          "Training developers on how to use AI effectively",
          "Measuring actual productivity improvement vs. perceived benefits",
          "Integrating AI tools with existing development workflows"
        ],
        correctAnswer: 2,
        category: "Management Challenges",
        difficulty: "easy",
        points: 5
      },
      {
        id: "em-012",
        question: "Which metric best indicates healthy AI tool adoption across your engineering team?",
        options: [
          "100% of developers have the tool installed",
          "AI-generated code makes up 40%+ of commits",
          "Consistent usage patterns across all experience levels",
          "Zero reported issues with AI-generated code"
        ],
        correctAnswer: 2,
        category: "Adoption Health",
        difficulty: "medium",
        points: 10
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
      // Only remove player from active players if game is not finished
      if (this.gameState.phase !== "finished") {
        this.gameState.players.delete(playerId);
        this.gameState.answers.delete(playerId);

        this.broadcast({
          type: "player_left",
          playerId
        });

        this.sendLeaderboard();
      } else {
        // Game is finished, just remove from active connections but keep in final rankings
        this.gameState.players.delete(playerId);
        this.broadcast({
          type: "player_left",
          playerId
        });
        // Don't recalculate leaderboard - keep frozen rankings
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
