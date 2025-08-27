<script lang="ts">
  import { onMount } from 'svelte';
  
  export let show: boolean = false;
  export let correct: boolean = false;

  let visible = false;

  // Show/hide animation control
  $: if (show) {
    visible = true;
    // Auto-hide after 3 seconds
    setTimeout(() => {
      visible = false;
    }, 3000);
  }
</script>

{#if visible}
  <div class="feedback-overlay" class:correct class:wrong={!correct}>
    <div class="feedback-content" class:correct class:wrong={!correct}>
      {#if correct}
        <div class="feedback-icon">🎉</div>
        <div class="feedback-text">CORRECT!</div>
        <div class="feedback-subtext">Nice work!</div>
      {:else}
        <div class="feedback-icon">❌</div>
        <div class="feedback-text">WRONG!</div>
        <div class="feedback-subtext">Better luck next time!</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .feedback-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    pointer-events: none;
    animation: feedback-slam 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .feedback-overlay.correct {
    background: radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%);
  }

  .feedback-overlay.wrong {
    background: radial-gradient(circle, rgba(248, 113, 113, 0.3) 0%, transparent 70%);
  }

  .feedback-content {
    text-align: center;
    padding: 3rem;
    border-radius: 25px;
    backdrop-filter: blur(20px);
    border: 3px solid;
    transform: scale(1);
    animation: content-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .feedback-content.correct {
    background: rgba(74, 222, 128, 0.2);
    border-color: rgba(74, 222, 128, 0.6);
    box-shadow: 0 0 50px rgba(74, 222, 128, 0.4);
  }

  .feedback-content.wrong {
    background: rgba(248, 113, 113, 0.2);
    border-color: rgba(248, 113, 113, 0.6);
    box-shadow: 0 0 50px rgba(248, 113, 113, 0.4);
  }

  .feedback-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: icon-spin 0.8s ease-out;
  }

  .feedback-text {
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }

  .feedback-subtext {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  }

  @keyframes feedback-slam {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    60% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes content-bounce {
    0% {
      transform: scale(0.3) rotate(-10deg);
    }
    50% {
      transform: scale(1.15) rotate(5deg);
    }
    70% {
      transform: scale(0.9) rotate(-2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes icon-spin {
    0% {
      transform: scale(0) rotate(0deg);
    }
    50% {
      transform: scale(1.2) rotate(180deg);
    }
    100% {
      transform: scale(1) rotate(360deg);
    }
  }

  /* Fade out animation */
  .feedback-overlay {
    animation: feedback-slam 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55),
               feedback-fadeout 0.5s ease-out 2.5s forwards;
  }

  @keyframes feedback-fadeout {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
  }
</style>
