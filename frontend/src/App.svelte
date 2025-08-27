<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { connected, currentPlayer, gameState, gameActions } from './lib/stores/game';
  import LobbyScreen from './lib/components/LobbyScreen.svelte';
  import GameScreen from './lib/components/GameScreen.svelte';
  import CursorTracker from './lib/components/CursorTracker.svelte';
  import EmojiOverlay from './lib/components/EmojiOverlay.svelte';

  let playerName = '';
  let hasJoined = false;

  onMount(() => {
    gameActions.connect();
  });

  onDestroy(() => {
    gameActions.disconnect();
  });

  function handleJoin() {
    if (playerName.trim()) {
      gameActions.joinGame(playerName.trim());
      hasJoined = true;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (hasJoined) {
      gameActions.sendCursor(event.clientX, event.clientY);
    }
  }
</script>

<svelte:window on:mousemove={handleMouseMove} />

<main class="game-container">
  {#if !$connected}
    <div class="connecting">
      <div class="spinner"></div>
      <p>Connecting to game server...</p>
    </div>
  {:else if !hasJoined}
    <div class="join-screen">
      <div class="join-card">
        <h1>🧠 AI Vocab Quiz</h1>
        <p>Test your AI knowledge with friends!</p>
        
        <form on:submit|preventDefault={handleJoin}>
          <input
            type="text"
            bind:value={playerName}
            placeholder="Enter your name"
            maxlength="20"
            required
          />
          <button type="submit" disabled={!playerName.trim()}>
            Join Game
          </button>
        </form>
      </div>
    </div>
  {:else}
    <!-- Game UI -->
    {#if $gameState.phase === 'lobby'}
      <LobbyScreen />
    {:else}
      <GameScreen />
    {/if}
    
    <!-- Overlays -->
    <CursorTracker />
    <EmojiOverlay />
  {/if}
</main>

<style>
  .game-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .connecting {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: white;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-left: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .join-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 2rem;
  }

  .join-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .join-card h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .join-card p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .join-card form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .join-card input {
    padding: 1rem;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 1.1rem;
    transition: border-color 0.2s;
  }

  .join-card input:focus {
    outline: none;
    border-color: #667eea;
  }

  .join-card button {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .join-card button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .join-card button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
