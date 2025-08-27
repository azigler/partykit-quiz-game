<script lang="ts">
  import type { Player } from '../stores/game';

  export let players: Player[];
</script>

<div class="leaderboard">
  <div class="leaderboard-header">
    <h3>🏆 Leaderboard</h3>
  </div>
  
  <div class="players-list">
    {#each players as player, index}
      <div class="player-rank" class:winner={index === 0} class:podium={index < 3}>
        <div class="rank-number">
          {#if index === 0}
            🥇
          {:else if index === 1}
            🥈
          {:else if index === 2}
            🥉
          {:else}
            #{index + 1}
          {/if}
        </div>
        
        <div class="player-info">
          <div class="player-name">{player.name}</div>
          <div class="player-score">{player.score} pts</div>
        </div>
        
        <div class="player-avatar">
          {player.name.charAt(0).toUpperCase()}
        </div>
      </div>
    {/each}
    
    {#if players.length === 0}
      <div class="empty-state">
        <p>No players yet</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .leaderboard {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    height: fit-content;
    max-height: 70vh;
    overflow-y: auto;
  }

  .leaderboard-header {
    margin-bottom: 1rem;
    text-align: center;
  }

  .leaderboard-header h3 {
    font-size: 1.3rem;
    margin: 0;
  }

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .player-rank {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    transition: all 0.2s;
  }

  .player-rank.winner {
    background: rgba(251, 191, 36, 0.2);
    border: 2px solid rgba(251, 191, 36, 0.4);
    animation: winner-glow 2s ease-in-out infinite alternate;
  }

  @keyframes winner-glow {
    0% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
    100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }
  }

  .player-rank.podium {
    background: rgba(255, 255, 255, 0.15);
  }

  .rank-number {
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
  }

  .player-info {
    flex: 1;
    min-width: 0;
  }

  .player-name {
    font-weight: 600;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-score {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .player-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .winner .player-avatar {
    background: rgba(251, 191, 36, 0.3);
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    opacity: 0.6;
  }

  /* Scrollbar styling */
  .leaderboard::-webkit-scrollbar {
    width: 4px;
  }

  .leaderboard::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  .leaderboard::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .leaderboard::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>
