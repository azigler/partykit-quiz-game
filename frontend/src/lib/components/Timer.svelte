<script lang="ts">
  import { timeRemaining } from '../stores/game';

  $: seconds = Math.ceil($timeRemaining / 1000);
  $: percentage = ($timeRemaining / 15000) * 100; // Assuming 15 second questions
  $: isUrgent = seconds <= 5;
</script>

<div class="timer-container">
  <div class="timer-circle" class:urgent={isUrgent}>
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle 
        cx="60" 
        cy="60" 
        r="50" 
        fill="none" 
        stroke="rgba(255, 255, 255, 0.2)" 
        stroke-width="10"
      />
      <circle 
        cx="60" 
        cy="60" 
        r="50" 
        fill="none" 
        stroke={isUrgent ? '#f87171' : '#4ade80'}
        stroke-width="10" 
        stroke-linecap="round"
        stroke-dasharray="314.16"
        stroke-dashoffset={314.16 - (314.16 * percentage / 100)}
        style="transform: rotate(-90deg); transform-origin: 50% 50%;"
        class="progress-ring"
      />
    </svg>
    <div class="timer-text" class:urgent={isUrgent}>
      {seconds}
    </div>
  </div>
  <div class="timer-label">
    {seconds > 1 ? 'seconds' : 'second'} left
  </div>
</div>

<style>
  .timer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .timer-circle {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .timer-circle.urgent {
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  .progress-ring {
    transition: stroke-dashoffset 0.1s linear, stroke 0.2s ease;
  }

  .timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
    transition: color 0.2s ease;
  }

  .timer-text.urgent {
    color: #f87171;
  }

  .timer-label {
    font-size: 0.9rem;
    opacity: 0.8;
    text-align: center;
  }
</style>
