<script lang="ts">
  import { recentEmojis, gameState } from '../stores/game';
  import { onMount } from 'svelte';

  let container: HTMLDivElement;

  function getPlayerName(playerId: string): string {
    const player = $gameState.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  }

  function getRandomPosition() {
    return {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50
    };
  }

  onMount(() => {
    // Clean up old emoji elements periodically
    const cleanup = setInterval(() => {
      if (container) {
        const now = Date.now();
        const elements = container.querySelectorAll('.floating-emoji');
        elements.forEach(el => {
          const timestamp = parseInt(el.getAttribute('data-timestamp') || '0');
          if (now - timestamp > 3000) { // Remove after 3 seconds
            el.remove();
          }
        });
      }
    }, 1000);

    return () => clearInterval(cleanup);
  });

  // React to new emojis
  $: {
    if (container && $recentEmojis.length > 0) {
      const latestEmoji = $recentEmojis[$recentEmojis.length - 1];
      const position = getRandomPosition();
      
      const element = document.createElement('div');
      element.className = 'floating-emoji';
      element.setAttribute('data-timestamp', latestEmoji.timestamp.toString());
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      element.innerHTML = `
        <div class="emoji-content">${latestEmoji.emoji}</div>
        <div class="emoji-sender">${getPlayerName(latestEmoji.playerId)}</div>
      `;
      
      container.appendChild(element);
      
      // Animate in
      setTimeout(() => element.classList.add('animate'), 10);
    }
  }
</script>

<div class="emoji-overlay" bind:this={container}>
  <!-- Floating emojis will be dynamically added here -->
</div>

<style>
  .emoji-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 500;
  }

  :global(.floating-emoji) {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    opacity: 0;
    transform: scale(0.5) translateY(20px);
    transition: all 0.3s ease-out;
    pointer-events: none;
  }

  :global(.floating-emoji.animate) {
    opacity: 1;
    transform: scale(1) translateY(0);
    animation: float-away 3s ease-out forwards;
  }

  :global(.emoji-content) {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  :global(.emoji-sender) {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    backdrop-filter: blur(10px);
  }

  @keyframes float-away {
    0% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    70% {
      transform: scale(1.2) translateY(-30px);
      opacity: 1;
    }
    100% {
      transform: scale(0.8) translateY(-60px);
      opacity: 0;
    }
  }
</style>
