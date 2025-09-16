<script lang="ts">
  import { gameState, sortedPlayers, isGameHost, gameActions, currentPlayer } from '../stores/game';
  import EmojiPicker from './EmojiPicker.svelte';

  $: canStartGame = $gameState.players.length >= 2;
</script>

<div class="lobby-screen">
  <div class="lobby-header">
    <h1>🧠 AI Vocab Quiz</h1>
    <p>Waiting for players to join...</p>
  </div>

  <div class="lobby-content">
    <div class="players-section">
      <h2>Players ({$gameState.players.length})</h2>
      <div class="players-list">
        {#each $sortedPlayers as player, index}
          <div class="player-card">
            <div class="player-avatar" class:host-avatar={player.isHost}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div class="player-info">
              <span class="player-name">{player.name}</span>
              <div class="player-badges">
                {#if $currentPlayer && player.id === $currentPlayer.id}
                  <span class="you-badge">👤 You</span>
                {/if}
                {#if player.isHost}
                  <span class="host-badge">👑 Host</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="game-controls">
      <div class="game-info">
        <div class="info-item">
          <span class="label">Game Mode:</span>
          <span class="value">AI Vocabulary Quiz</span>
        </div>
        <div class="info-item">
          <span class="label">Questions:</span>
          <span class="value">Multiple rounds</span>
        </div>
        <div class="info-item">
          <span class="label">Time per question:</span>
          <span class="value">15 seconds</span>
        </div>
      </div>

      {#if $isGameHost}
        <button 
          class="start-button"
          on:click={gameActions.startGame}
          disabled={!canStartGame}
        >
          {canStartGame ? 'Start Game' : 'Need at least 2 players'}
        </button>
      {:else}
        <div class="waiting-message">
          <p>Waiting for host to start the game...</p>
        </div>
      {/if}
    </div>

    <div class="interaction-section">
      <p class="interaction-hint">Send some emojis while we wait! 👇</p>
      <EmojiPicker />
    </div>
  </div>
</div>

<style>
  .lobby-screen {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
  }

  .lobby-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .lobby-header h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .lobby-header p {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .lobby-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .players-section h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .player-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 10px;
    backdrop-filter: blur(10px);
  }

  .player-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .player-avatar.host-avatar {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
    border: 2px solid rgba(251, 191, 36, 0.4);
  }

  .player-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .player-name {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .player-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .host-badge {
    font-size: 0.8rem;
    background: rgba(251, 191, 36, 0.2);
    color: rgba(251, 191, 36, 1);
    padding: 0.2rem 0.5rem;
    border-radius: 15px;
    width: fit-content;
    border: 1px solid rgba(251, 191, 36, 0.4);
  }

  .you-badge {
    font-size: 0.8rem;
    background: rgba(244, 114, 182, 0.2);
    color: rgba(244, 114, 182, 1);
    padding: 0.2rem 0.5rem;
    border-radius: 15px;
    width: fit-content;
    border: 1px solid rgba(244, 114, 182, 0.4);
  }

  .game-controls {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .game-info {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 10px;
    backdrop-filter: blur(10px);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .label {
    opacity: 0.8;
  }

  .value {
    font-weight: 600;
  }

  .start-button {
    padding: 1.5rem;
    font-size: 1.2rem;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
  }

  .start-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .start-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .waiting-message {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .interaction-section {
    grid-column: 1 / -1;
    text-align: center;
    margin-top: 2rem;
  }

  .interaction-hint {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .lobby-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .lobby-header h1 {
      font-size: 2rem;
    }
  }
</style>
