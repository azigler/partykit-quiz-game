<script lang="ts">
  import { onMount } from 'svelte';
  
  export let show: boolean = false;
  export let correct: boolean = false;

  let container: HTMLDivElement;
  
  onMount(() => {
    if (show) {
      triggerEffect();
    }
  });

  $: if (show && container) {
    triggerEffect();
  }

  function triggerEffect() {
    if (!container) return;
    
    // Clear previous effects
    container.innerHTML = '';
    
    if (correct) {
      // Celebration effects for correct answers
      createConfetti();
      createSparkles();
      triggerScreenShake('celebration');
    } else {
      // Error effects for wrong answers  
      createErrorWave();
      triggerScreenShake('error');
    }
  }

  function createConfetti() {
    const colors = ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 4000);
    }
  }

  function createSparkles() {
    for (let i = 0; i < 30; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 2 + 's';
      sparkle.innerHTML = '✨';
      container.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 3000);
    }
  }

  function createErrorWave() {
    const wave = document.createElement('div');
    wave.className = 'error-wave';
    container.appendChild(wave);
    
    setTimeout(() => wave.remove(), 1000);
  }

  function triggerScreenShake(type: 'celebration' | 'error') {
    const gameScreen = document.querySelector('.game-screen');
    if (!gameScreen) return;
    
    gameScreen.classList.add(type === 'celebration' ? 'shake-celebration' : 'shake-error');
    
    setTimeout(() => {
      gameScreen.classList.remove('shake-celebration', 'shake-error');
    }, type === 'celebration' ? 1000 : 600);
  }
</script>

<div class="effects-container" bind:this={container}>
  <!-- Effects will be dynamically added here -->
</div>

<style>
  .effects-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
    overflow: hidden;
  }

  :global(.confetti) {
    position: absolute;
    top: -10px;
    width: 10px;
    height: 10px;
    background: #4ade80;
    animation: confetti-fall linear forwards;
  }

  :global(.sparkle) {
    position: absolute;
    font-size: 2rem;
    animation: sparkle-bounce 1.5s ease-out forwards;
    pointer-events: none;
  }

  :global(.error-wave) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(248, 113, 113, 0.8) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: error-pulse 0.6s ease-out forwards;
  }

  /* Screen shake animations */
  :global(.shake-celebration) {
    animation: celebration-shake 1s ease-in-out;
  }

  :global(.shake-error) {
    animation: error-shake 0.6s ease-in-out;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes sparkle-bounce {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.5) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes error-pulse {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.8;
    }
    50% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0.4;
    }
    100% {
      transform: translate(-50%, -50%) scale(4);
      opacity: 0;
    }
  }

  @keyframes celebration-shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-5px) rotate(1deg); }
    20% { transform: translateX(5px) rotate(-1deg); }
    30% { transform: translateX(-3px) rotate(1deg); }
    40% { transform: translateX(3px) rotate(-1deg); }
    50% { transform: translateX(-2px) rotate(1deg); }
    60% { transform: translateX(2px) rotate(-1deg); }
    70% { transform: translateX(-1px) rotate(1deg); }
    80% { transform: translateX(1px) rotate(-1deg); }
    90% { transform: translateX(-0.5px) rotate(0deg); }
  }

  @keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-10px); }
    20% { transform: translateX(10px); }
    30% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    50% { transform: translateX(-5px); }
    60% { transform: translateX(5px); }
    70% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
    90% { transform: translateX(-1px); }
  }
</style>
