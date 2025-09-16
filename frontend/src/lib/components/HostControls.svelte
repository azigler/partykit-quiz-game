<script lang="ts">
  import { isGameHost, gameActions } from '../stores/game';

  let showConfirmDialog = false;

  function handleResetClick() {
    showConfirmDialog = true;
  }

  function confirmReset() {
    gameActions.resetGame();
    showConfirmDialog = false;
  }

  function cancelReset() {
    showConfirmDialog = false;
  }
</script>

{#if $isGameHost}
  <div class="host-controls">
    <button 
      class="reset-button" 
      on:click={handleResetClick}
      title="Reset game and return everyone to lobby"
    >
      🔄 Reset Game
    </button>
    
    {#if showConfirmDialog}
      <div class="confirm-overlay">
        <div class="confirm-dialog">
          <h3>Reset Game?</h3>
          <p>This will reset the game and send everyone back to the lobby. Are you sure?</p>
          <div class="confirm-buttons">
            <button class="confirm-yes" on:click={confirmReset}>Yes, Reset</button>
            <button class="confirm-no" on:click={cancelReset}>Cancel</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .host-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .reset-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
  }

  .reset-button:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
  }

  .reset-button:active {
    transform: translateY(0);
  }

  .confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .confirm-dialog {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    margin: 20px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .confirm-dialog h3 {
    margin: 0 0 12px 0;
    color: #dc3545;
    font-size: 20px;
  }

  .confirm-dialog p {
    margin: 0 0 20px 0;
    color: #666;
    line-height: 1.4;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .confirm-yes,
  .confirm-no {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .confirm-yes {
    background: #dc3545;
    color: white;
  }

  .confirm-yes:hover {
    background: #c82333;
  }

  .confirm-no {
    background: #6c757d;
    color: white;
  }

  .confirm-no:hover {
    background: #5a6268;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .host-controls {
      top: 10px;
      right: 10px;
      z-index: 1100;
    }

    .reset-button {
      padding: 8px 12px;
      font-size: 12px;
    }

    .confirm-dialog {
      margin: 15px;
      padding: 20px;
      max-width: calc(100vw - 30px);
    }

    .confirm-dialog h3 {
      font-size: 18px;
    }

    .confirm-dialog p {
      font-size: 14px;
    }

    .confirm-buttons {
      flex-direction: column;
    }
    
    .confirm-yes,
    .confirm-no {
      padding: 12px 20px;
    }
  }
  
  @media (max-width: 480px) {
    .reset-button {
      padding: 6px 10px;
      font-size: 11px;
    }
    
    .confirm-dialog {
      margin: 10px;
      padding: 15px;
    }
  }
</style>