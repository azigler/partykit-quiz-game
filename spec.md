# AI Vocab Quiz Game - Project Specification

## Overview
A multiplayer, real-time vocabulary quiz game focused on AI terminology. Designed as a disposable icebreaker application for group learning and engagement.

## Architecture

### High-Level Design
- **Backend**: PartyKit server deployed as Cloudflare Durable Object
- **Frontend**: Lightweight web app (Svelte/React/Solid.js with Vite)
- **Content**: Decoupled JSON-based quiz content system
- **Hosting**: Cloudflare Pages/Workers for both frontend and backend

### System Components

#### 1. Backend Server (`/backend`)
- **Technology**: PartyKit on Cloudflare Durable Objects
- **Responsibilities**:
  - Manage game lobbies and player connections
  - Handle real-time communication between players
  - Game state management (questions, timing, scoring)
  - Live cursor tracking and emoji reactions
  - Leaderboard management
  - Question progression and timing control

#### 2. Frontend Web App (`/frontend`)
- **Technology**: Vite + Svelte (lightweight choice)
- **Hosting**: Cloudflare Pages
- **Features**:
  - Player name entry and lobby connection
  - Real-time quiz interface
  - Live emoji reactions and chat
  - Cursor tracking visualization
  - Leaderboard display
  - Question display with multiple choice options
  - Timer visualization
  - Answer feedback and scoring

#### 3. Content System (`/content`)
- **Technology**: JSON-based content files
- **Structure**: Modular, easily editable quiz content
- **Features**:
  - AI vocabulary questions and answers
  - Multiple choice options
  - Difficulty levels
  - Question categories
  - Scoring weights

## Game Flow

### Player Experience
1. **Connection**: Player opens web app link
2. **Lobby Entry**: Enter name, connect to shared lobby
3. **Pre-Game**: See other players, interact with emojis/cursors
4. **Quiz Rounds**:
   - Question displayed with multiple choice options
   - Countdown timer (configurable duration)
   - Players select answers
   - Correct answer revealed
   - Points distributed
   - Updated leaderboard shown
5. **Next Question**: Automatic progression through content
6. **Game End**: Final leaderboard and celebration

### Technical Flow
1. Frontend loads and connects to PartyKit backend
2. Backend manages lobby state and player connections
3. Backend loads quiz content from JSON
4. Backend orchestrates game timing and progression
5. Real-time updates sent to all connected clients
6. Frontend renders game state and player interactions

## Real-Time Features
- **Live Cursors**: See other players' mouse movements (lobby only - hidden during questions to prevent cheating)
- **Emoji Reactions**: Spam-friendly emoji interaction system with floating animations
- **Shared Environment**: All players see the same dynamic state
- **Instant Feedback**: Immediate answer validation with visual effects (confetti for correct, error waves for wrong)
- **Live Leaderboard**: Real-time ranking updates with winner highlighting
- **Player Identification**: "You" badges for self-identification, "Host" badges for game control

## Content Management
- **Decoupled Design**: Content independent of application code
- **JSON Structure**: Easy to edit and version control
- **Hot Swappable**: Content updates without code changes
- **Expandable**: Support for multiple question sets/themes

## Deployment Strategy
- **Backend**: Cloudflare Workers + Durable Objects via PartyKit
- **Frontend**: Cloudflare Pages with automatic deployments
- **Content**: Static JSON files served via CDN
- **Domain**: Custom domain pointing to Cloudflare infrastructure

## Development Phases

### Phase 1: Core Infrastructure
- Set up PartyKit backend with basic lobby functionality
- Create Svelte frontend with PartyKit connection
- Implement basic player management and real-time communication

### Phase 2: Game Logic
- Add quiz question display and answer handling
- Implement timing system and automatic progression
- Create scoring and leaderboard systems
- Load and parse JSON content

### Phase 3: Interactive Features
- Add live cursor tracking
- Implement emoji reaction system
- Enhance UI/UX with animations and feedback
- Add game state persistence

### Phase 4: Content & Polish
- Create comprehensive AI vocabulary question set
- Add question categories and difficulty levels
- Implement responsive design
- Add deployment configuration and CI/CD

## Technical Decisions

### Why PartyKit?
- Built specifically for real-time multiplayer experiences
- Seamless Cloudflare integration
- Handles WebSocket connections and state management
- Built-in cursor tracking and presence features

### Why Svelte?
- Lightweight bundle size (important for mobile users)
- Excellent performance for real-time updates
- Simple, readable code for rapid development
- Great TypeScript support

### Why Cloudflare?
- Global edge deployment for low latency
- Durable Objects for consistent game state
- Generous free tier for prototype/icebreaker use
- Integrated hosting for both frontend and backend

## UI/UX Improvements

### Player Identification System
- **"You" Badge**: Blue badge (👤) identifies your own player across all screens
- **"Host" Badge**: Golden badge (👑) identifies the game host across all screens
- **Host Avatar**: Golden gradient background for host player avatar
- **Independent Tracking**: Each browser tab correctly identifies its own player

### Visual Feedback System
- **Answer Effects**: 
  - Correct answers trigger confetti, sparkles, and celebration screen shake
  - Wrong answers trigger red error waves and error screen shake
- **Timer Prominence**: Large, prominent countdown timer with urgency colors (red when ≤5 seconds)
- **Question Numbering**: Properly tracks and displays current question number
- **Fast-Paced Flow**: Reduced delays between questions (2 seconds) for better engagement

### Anti-Cheating Measures
- **Cursor Hiding**: Live cursors only visible in lobby, hidden during questions to prevent cheating
- **Host-Only Controls**: Only the actual host can start games, preventing unauthorized game control
- **Independent Sessions**: Each browser tab maintains its own player identity

### Enhanced Interactivity
- **Floating Emojis**: Emoji reactions appear as floating animations with player attribution
- **Answer Selection Feedback**: Visual feedback when selecting answers
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Success Metrics
- **Performance**: Sub-100ms response times for interactions
- **Reliability**: 99.9% uptime during game sessions
- **Usability**: Players can join and start playing within 30 seconds
- **Scalability**: Support 10-20 concurrent players per lobby
- **Maintainability**: Content updates possible without technical knowledge
- **Fairness**: Anti-cheating measures ensure fair gameplay
- **Engagement**: Visual effects and fast pacing maintain player interest

## File Structure
```
ai-vocab-quiz-game/
├── spec.md                 # This document
├── README.md              # Project overview and setup instructions
├── package.json           # Root workspace configuration
├── backend/               # PartyKit server
│   ├── src/
│   ├── package.json
│   └── partykit.json
├── frontend/              # Svelte web app
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── content/               # Quiz content
    ├── ai-vocabulary.json
    └── question-schema.json
```
