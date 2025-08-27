<script lang="ts">
  import { cursors, gameState } from '../stores/game';

  function getPlayerName(playerId: string): string {
    const player = $gameState.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  }

  // Only show cursors in lobby to prevent cheating
  $: showCursors = $gameState.phase === 'lobby';
</script>

{#if showCursors}
  {#each Array.from($cursors.entries()) as [playerId, position]}
    <div 
      class="cursor" 
      style="left: {position.x}px; top: {position.y}px;"
    >
      <div class="cursor-pointer"></div>
      <div class="cursor-name">{getPlayerName(playerId)}</div>
    </div>
  {/each}
{/if}

<style>
  .cursor {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -50%);
    transition: left 0.1s ease-out, top 0.1s ease-out;
  }

  .cursor-pointer {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(5px);
    animation: pulse 1s ease-in-out infinite alternate;
  }

  .cursor-name {
    position: absolute;
    top: 25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.3rem 0.6rem;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    backdrop-filter: blur(10px);
  }

  @keyframes pulse {
    0% { 
      transform: scale(1);
      opacity: 0.8;
    }
    100% { 
      transform: scale(1.2);
      opacity: 1;
    }
  }
</style>
