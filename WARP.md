# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Quick Start
```bash
npm install          # Install all dependencies (backend + frontend)
npm run dev          # Start both backend (PartyKit) and frontend (Vite) concurrently
```

**Development servers:**
- Frontend: http://localhost:3000
- Backend: http://localhost:1999

**Production URLs:**
- Frontend: https://partykit-quiz-game.pages.dev
- Backend: https://ai-vocab-quiz-game.azigler.partykit.dev

### Individual Components
```bash
# Backend only (PartyKit server)
cd backend && npm run dev

# Frontend only (Svelte app)
cd frontend && npm run dev
```

### Build & Deploy
```bash
npm run build        # Build both applications for production
npm run deploy       # Deploy both to Cloudflare (requires setup)

# Individual deployments
npm run build:backend && cd backend && npm run deploy    # Backend to Cloudflare Workers
npm run build:frontend && cd frontend && npm run deploy  # Frontend to Cloudflare Pages
```

### Development Tools
```bash
# Backend
cd backend && npm run tail    # View PartyKit deployment logs

# Frontend
cd frontend && npm run preview    # Preview production build locally
cd frontend && npm run check      # Run Svelte type checking
```

## Architecture Overview

This is a **real-time multiplayer quiz game** built with a modern full-stack architecture optimized for low-latency interactions.

### Core Technologies
- **Backend**: PartyKit server (TypeScript) deployed on Cloudflare Durable Objects
- **Frontend**: Svelte + Vite application hosted on Cloudflare Pages
- **Real-time Communication**: WebSocket connections via PartySocket
- **Content**: JSON-based quiz questions with schema validation

### Application Structure

#### Backend (`/backend/src/server.ts`)
The PartyKit server manages the entire game lifecycle:
- **Game State Management**: Handles `lobby`, `question`, `results`, and `finished` phases
- **Player Management**: Tracks players with scores, connection times, and answers
- **Real-time Features**: Live cursor tracking and emoji reactions
- **Question Orchestration**: Loads questions, manages timing (15s per question), and calculates scores
- **Anti-cheating**: Prevents unauthorized game controls and maintains fair gameplay

Key interfaces:
- `GameState`: Central game state with phases, players, current question, and timing
- `Player`: Player data including score and connection info
- `Question`: Question structure with options, correct answer, difficulty, and points

#### Frontend (`/frontend/src/`)
Svelte application with reactive state management:
- **Store Architecture**: Centralized state in `/lib/stores/game.ts` using Svelte stores
- **Component System**: Modular UI components in `/lib/components/`
- **Real-time Integration**: PartySocket client for WebSocket communication

Key stores:
- `gameState`: Main game state synchronized with backend
- `cursors`: Live cursor tracking for multiplayer interaction
- `recentEmojis`: Emoji reaction system with floating animations
- `finalRankings`: Frozen leaderboard when game ends

#### Content System (`/content/`)
Decoupled quiz content management:
- `ai-vocabulary.json`: Question database with AI/ML vocabulary
- `question-schema.json`: JSON schema for question validation

### Real-time Features Implementation

#### WebSocket Communication Pattern
```typescript
// Backend message types
type ClientMessage = 
  | { type: "join"; name: string }
  | { type: "answer"; option: number }
  | { type: "emoji"; emoji: string }
  | { type: "cursor"; x: number; y: number }

type ServerMessage = 
  | { type: "game_state"; state: Partial<GameState> }
  | { type: "question_start"; question: Question }
  | { type: "leaderboard"; players: Player[] }
```

#### State Synchronization
- Backend maintains authoritative game state in Durable Objects
- Frontend stores receive real-time updates via WebSocket messages
- Cursor and emoji data flows through separate channels for performance

### Game Flow Architecture

1. **Lobby Phase**: Players join, see live cursors and emoji reactions
2. **Question Phase**: 15-second timed questions with multiple choice
3. **Results Phase**: Answer reveal with visual effects (confetti/error waves)
4. **Finished Phase**: Final leaderboard with frozen rankings

### Development Patterns

#### Adding New Question Content
Questions follow a strict schema in `content/question-schema.json`:
```json
{
  "id": "unique-id",
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "category": "AI Models",
  "difficulty": "medium",
  "points": 10,
  "explanation": "Why this answer is correct"
}
```

#### Component Architecture
- `App.svelte`: Main application with connection management
- `LobbyScreen.svelte`: Pre-game player management
- `GameScreen.svelte`: Active quiz interface
- `CursorTracker.svelte` & `EmojiOverlay.svelte`: Real-time interactive overlays

### Environment Configuration

#### Development vs Production
- **Development**: Backend connects to `127.0.0.1:1999` (local PartyKit)
- **Production**: Backend connects to `ai-vocab-quiz-game.azigler.partykit.dev`

The host configuration in `frontend/src/lib/stores/game.ts` automatically switches based on `import.meta.env.DEV`.

#### PartyKit Configuration
Backend configuration in `backend/partykit.json` specifies:
- Project name: `ai-vocab-quiz-game`
- Entry point: `src/server.ts`
- Compatibility date for Cloudflare Workers API

### Performance Considerations

- **Bundle Size**: Svelte chosen for minimal JavaScript bundle
- **Real-time Performance**: Cursor updates throttled to prevent WebSocket flooding
- **State Management**: Frozen rankings prevent unnecessary re-renders after game completion
- **Anti-cheating**: Cursors hidden during questions to prevent answer signaling

### Deployment Architecture

This application uses Cloudflare's edge infrastructure:
- **Backend**: Deployed as Cloudflare Workers with Durable Objects for state persistence
- **Frontend**: Static site hosted on Cloudflare Pages with global CDN
- **Real-time**: WebSocket connections handled by PartyKit's infrastructure

The npm workspace structure allows for coordinated deployments while maintaining separate concerns for backend and frontend code.