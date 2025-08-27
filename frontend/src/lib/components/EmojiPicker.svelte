<script lang="ts">
  import { gameActions } from '../stores/game';

  const emojis = ['🎉', '😍', '🤔', '😅', '🙌', '👏', '🔥', '💯', '😎', '🧠', '🤖', '⚡'];

  function sendEmoji(emoji: string) {
    gameActions.sendEmoji(emoji);
  }
</script>

<div class="emoji-picker">
  {#each emojis as emoji}
    <button class="emoji-button" on:click={() => sendEmoji(emoji)}>
      {emoji}
    </button>
  {/each}
</div>

<style>
  .emoji-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 300px;
    margin: 0 auto;
  }

  .emoji-button {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
  }

  .emoji-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }

  .emoji-button:active {
    transform: scale(0.95);
  }
</style>
