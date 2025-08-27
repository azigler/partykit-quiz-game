<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  export let show: boolean = false;
  export let playerName: string = '';

  let container: HTMLDivElement;
  let animationId: number;
  let fireworksInterval: NodeJS.Timeout;
  let sparkleInterval: NodeJS.Timeout;

  onMount(() => {
    if (show) {
      startCelebration();
    }
  });

  onDestroy(() => {
    stopCelebration();
  });

  $: if (show) {
    startCelebration();
  } else {
    stopCelebration();
  }

  function startCelebration() {
    if (!container) return;
    
    // Continuous fireworks
    fireworksInterval = setInterval(() => {
      createFirework();
    }, 800);

    // Continuous sparkles
    sparkleInterval = setInterval(() => {
      createSparkles();
    }, 400);

    // Initial burst
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createFirework(), i * 200);
    }
    
    createMegaSparkles();
  }

  function stopCelebration() {
    if (fireworksInterval) clearInterval(fireworksInterval);
    if (sparkleInterval) clearInterval(sparkleInterval);
    if (animationId) cancelAnimationFrame(animationId);
  }

  function createFirework() {
    if (!container) return;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#fd79a8'];
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    const x = Math.random() * (window.innerWidth - 200) + 100;
    const y = Math.random() * (window.innerHeight - 400) + 200;
    
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = (i / 12) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      particle.style.setProperty('--end-x', endX + 'px');
      particle.style.setProperty('--end-y', endY + 'px');
      particle.style.animationDelay = Math.random() * 0.3 + 's';
      
      firework.appendChild(particle);
    }
    
    container.appendChild(firework);
    
    setTimeout(() => {
      if (firework.parentNode) {
        firework.parentNode.removeChild(firework);
      }
    }, 2000);
  }

  function createSparkles() {
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'winner-sparkle';
      sparkle.innerHTML = ['✨', '⭐', '🌟', '💫', '⚡'][Math.floor(Math.random() * 5)];
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 2 + 's';
      sparkle.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
      
      container.appendChild(sparkle);
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 3000);
    }
  }

  function createMegaSparkles() {
    if (!container) return;

    // Giant sparkles for extra effect
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'mega-sparkle';
      sparkle.innerHTML = '✨';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 1 + 's';
      
      container.appendChild(sparkle);
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 4000);
    }
  }
</script>

{#if show}
  <div class="celebration-overlay" bind:this={container}>
    <div class="winner-content">
      <div class="winner-announcement">
        <div class="winner-icon">🏆</div>
        <div class="winner-title">YOU WON!</div>
        <div class="winner-subtitle">🎉 THAT'S YOU! 🎉</div>
        <div class="winner-name">{playerName}</div>
        <div class="winner-message">
          <div class="message-line">INCREDIBLE!</div>
          <div class="message-line">YOU'RE THE CHAMPION!</div>
          <div class="message-line">🌟 AMAZING WORK! 🌟</div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .celebration-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 3000;
    pointer-events: none;
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
    animation: celebration-pulse 2s ease-in-out infinite alternate;
  }

  .winner-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    animation: winner-entrance 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .winner-announcement {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
    border: 4px solid rgba(255, 215, 0, 0.8);
    border-radius: 30px;
    padding: 3rem;
    backdrop-filter: blur(20px);
    box-shadow: 
      0 0 50px rgba(255, 215, 0, 0.6),
      inset 0 0 30px rgba(255, 215, 0, 0.2);
    animation: winner-glow 2s ease-in-out infinite alternate;
  }

  .winner-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: trophy-bounce 1s ease-in-out infinite alternate;
  }

  .winner-title {
    font-size: 4rem;
    font-weight: 900;
    color: #ffd700;
    text-shadow: 
      3px 3px 0px #ff8c00,
      -1px -1px 0px #ff8c00,
      1px -1px 0px #ff8c00,
      -1px 1px 0px #ff8c00,
      4px 4px 8px rgba(0, 0, 0, 0.5);
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
    animation: title-pulse 1.5s ease-in-out infinite;
  }

  .winner-subtitle {
    font-size: 2.5rem;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    margin-bottom: 1.5rem;
    animation: subtitle-bounce 2s ease-in-out infinite;
  }

  .winner-name {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(45deg, #ffd700, #ff8c00, #ffd700, #ff8c00);
    background-size: 400% 400%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: name-gradient 3s ease-in-out infinite, name-scale 2s ease-in-out infinite alternate;
    margin-bottom: 2rem;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .winner-message {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message-line {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    opacity: 0;
    animation: message-appear 0.8s ease-out forwards;
  }

  .message-line:nth-child(1) { animation-delay: 0.5s; }
  .message-line:nth-child(2) { animation-delay: 1s; }
  .message-line:nth-child(3) { animation-delay: 1.5s; }

  /* Fireworks */
  :global(.firework) {
    position: absolute;
    pointer-events: none;
  }

  :global(.firework-particle) {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: firework-explode 1.5s ease-out forwards;
  }

  /* Sparkles */
  :global(.winner-sparkle) {
    position: absolute;
    pointer-events: none;
    animation: sparkle-float 3s ease-out forwards;
    font-size: 2rem;
    z-index: 1000;
  }

  :global(.mega-sparkle) {
    position: absolute;
    pointer-events: none;
    font-size: 4rem;
    animation: mega-sparkle-spin 4s ease-out forwards;
    z-index: 1000;
  }

  /* Animations */
  @keyframes celebration-pulse {
    0% { background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%); }
    100% { background: radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, transparent 80%); }
  }

  @keyframes winner-entrance {
    0% { 
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3) rotate(-20deg);
    }
    60% { 
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    }
    100% { 
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
  }

  @keyframes winner-glow {
    0% {
      box-shadow: 
        0 0 50px rgba(255, 215, 0, 0.6),
        inset 0 0 30px rgba(255, 215, 0, 0.2);
    }
    100% {
      box-shadow: 
        0 0 80px rgba(255, 215, 0, 0.9),
        inset 0 0 50px rgba(255, 215, 0, 0.4);
    }
  }

  @keyframes trophy-bounce {
    0% { transform: scale(1) rotate(0deg); }
    100% { transform: scale(1.2) rotate(10deg); }
  }

  @keyframes title-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes subtitle-bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes name-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes name-scale {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  @keyframes message-appear {
    0% { 
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    100% { 
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
  }

  @keyframes firework-explode {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(var(--end-x), var(--end-y)) scale(0);
    }
  }

  @keyframes sparkle-float {
    0% {
      opacity: 0;
      transform: translateY(20px) rotate(0deg) scale(0);
    }
    20% {
      opacity: 1;
      transform: translateY(0px) rotate(180deg) scale(1.2);
    }
    80% {
      opacity: 1;
      transform: translateY(-30px) rotate(300deg) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-60px) rotate(360deg) scale(0);
    }
  }

  @keyframes mega-sparkle-spin {
    0% {
      opacity: 0;
      transform: rotate(0deg) scale(0);
    }
    20% {
      opacity: 1;
      transform: rotate(720deg) scale(1.5);
    }
    80% {
      opacity: 1;
      transform: rotate(1080deg) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: rotate(1440deg) scale(0);
    }
  }

  @media (max-width: 768px) {
    .winner-title {
      font-size: 3rem;
    }
    
    .winner-subtitle {
      font-size: 2rem;
    }
    
    .winner-name {
      font-size: 2.5rem;
    }
    
    .message-line {
      font-size: 1.5rem;
    }
  }
</style>
