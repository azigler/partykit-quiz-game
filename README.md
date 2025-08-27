# 🎉 PartyKit Quiz Game

A multiplayer, real-time quiz game built with PartyKit. Perfect as an icebreaker for group learning sessions or team building activities!

## 🚀 Features

- **Real-time Multiplayer**: Play with friends using PartyKit for seamless real-time communication
- **Live Interactions**: See other players' cursors and send emoji reactions
- **Customizable Content**: Easy-to-edit JSON question format - comes with AI vocabulary but supports any topic
- **Engaging UI**: Beautiful, responsive Svelte interface with smooth animations and celebration effects
- **Instant Deployment**: Deploy to Cloudflare with a single command
- **Lobby System**: Host-controlled games with real-time player management

## 🏗️ Architecture

- **Backend**: PartyKit server deployed on Cloudflare Durable Objects
- **Frontend**: Svelte + Vite web app hosted on Cloudflare Pages  
- **Content**: Decoupled JSON-based quiz questions
- **Real-time**: WebSocket connections for live cursor tracking and emoji reactions

## 📁 Project Structure

```
partykit-quiz-game/
├── spec.md                 # Detailed project specification
├── README.md              # This file
├── package.json           # Root workspace configuration
├── backend/               # PartyKit server
│   ├── src/server.ts      # Main game logic
│   ├── package.json       # Backend dependencies
│   └── partykit.json      # PartyKit configuration
├── frontend/              # Svelte web app
│   ├── src/
│   │   ├── App.svelte     # Main application component
│   │   ├── lib/
│   │   │   ├── stores/    # Svelte stores for state management
│   │   │   └── components/ # Reusable UI components
│   │   └── main.ts        # Application entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── content/               # Quiz content
    ├── ai-vocabulary.json # Example question dataset (25+ questions)
    └── question-schema.json # JSON schema for questions
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd partykit-quiz-game
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```
   This starts both the backend (PartyKit) and frontend (Vite) servers concurrently.

3. **Open the Game**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:1999

### Individual Components

**Backend Only:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Only:**
```bash
cd frontend  
npm install
npm run dev
```

## 🎮 How to Play

1. **Join a Lobby**: Enter your name and connect to the game
2. **Wait for Players**: Host can start the game when 2+ players join
3. **Answer Questions**: Select from multiple choice options within the time limit
4. **See Results**: View correct answers and updated leaderboard
5. **Interactive Fun**: Send emojis and see other players' cursors throughout
6. **Win**: Player with the most points at the end wins! 🏆

## 🚀 Deployment

### Backend (PartyKit to Cloudflare)

1. **Setup PartyKit Account**: Visit [partykit.io](https://partykit.io)
2. **Deploy Backend**:
   ```bash
   cd backend
   npm run deploy
   ```

### Frontend (Cloudflare Pages)

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```
   Or manually upload the `dist/` folder to Cloudflare Pages.

3. **Update Configuration**: Update the PartyKit host URL in `frontend/src/lib/stores/game.ts`

## 🎯 Customizing Content

### Adding New Questions

Edit `content/ai-vocabulary.json` or create your own question file:

```json
{
  "id": "custom-001",
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "category": "Your Category", 
  "difficulty": "easy|medium|hard",
  "points": 5,
  "explanation": "Why this answer is correct"
}
```

### Example Categories

The included AI vocabulary dataset contains:
- AI Models (GPT, LLM, etc.)
- AI Concepts (hallucination, bias, etc.)
- Machine Learning (supervised, unsupervised, etc.)
- AI Architecture (neural networks, deep learning, etc.)
- AI Applications (prompt engineering, APIs, etc.)
- AI Ethics (explainable AI, bias, etc.)

**But you can create questions for any topic!** History, science, pop culture, company trivia, etc.

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build both applications  
- `npm run deploy` - Deploy both to Cloudflare
- `npm run clean` - Clean all node_modules

### Backend
- `npm run dev` - Start PartyKit development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Cloudflare
- `npm run tail` - View deployment logs

### Frontend  
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

## 🎨 Tech Stack

- **Backend**: PartyKit, TypeScript, Cloudflare Durable Objects
- **Frontend**: Svelte, TypeScript, Vite, PartySocket
- **Styling**: CSS with custom properties, backdrop filters
- **Real-time**: WebSocket connections via PartyKit
- **Deployment**: Cloudflare Workers + Pages
- **Build Tools**: Vite, TypeScript, npm workspaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally: `npm run dev`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Adding Questions

We welcome new quiz questions! Please ensure they:
- Follow the JSON schema in `content/question-schema.json`
- Include accurate explanations
- Cover your chosen topics thoroughly
- Have appropriate difficulty ratings

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- Check the [spec.md](spec.md) for detailed technical information
- Open an issue for bugs or feature requests
- Review the code comments for implementation details

## 🎉 Acknowledgments

- Built with [PartyKit](https://partykit.io) for seamless real-time multiplayer
- UI powered by [Svelte](https://svelte.dev) for performance and simplicity
- Deployed on [Cloudflare](https://cloudflare.com) for global edge performance
- Inspired by the need for fun, interactive learning experiences

---

**Ready to host your own quiz party?** 🎉🧠
