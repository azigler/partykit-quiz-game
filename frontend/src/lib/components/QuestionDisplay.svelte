<script lang="ts">
  import type { Question } from '../stores/game';

  export let question: Question;
  export let selectedAnswer: number | null;
  export let onSelect: (option: number) => void;
  export let disabled: boolean = false;
</script>

<div class="question-display">
  <div class="question-header">
    <div class="difficulty-badge" class:easy={question.difficulty === 'easy'} 
         class:medium={question.difficulty === 'medium'} 
         class:hard={question.difficulty === 'hard'}>
      {question.difficulty}
    </div>
    <div class="points">{question.points} pts</div>
  </div>

  <div class="question-text">
    <h2>{question.question}</h2>
  </div>

  <div class="options-grid">
    {#each question.options as option, index}
      <button 
        class="option-button"
        class:selected={selectedAnswer === index}
        class:disabled
        on:click={() => onSelect(index)}
        disabled={disabled}
      >
        <span class="option-letter">{String.fromCharCode(65 + index)}</span>
        <span class="option-text">{option}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .question-display {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    max-width: 800px;
    width: 100%;
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .difficulty-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .difficulty-badge.easy {
    background: rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }

  .difficulty-badge.medium {
    background: rgba(251, 191, 36, 0.3);
    color: #fbbf24;
  }

  .difficulty-badge.hard {
    background: rgba(248, 113, 113, 0.3);
    color: #f87171;
  }

  .points {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
  }

  .question-text {
    text-align: center;
    margin-bottom: 3rem;
  }

  .question-text h2 {
    font-size: 1.8rem;
    line-height: 1.4;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .option-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .option-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  .option-button.selected {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
  }

  .option-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .option-button.disabled.selected {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .option-letter {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .option-button.selected .option-letter {
    background: rgba(255, 255, 255, 0.4);
  }

  .option-text {
    flex: 1;
    line-height: 1.3;
  }

  @media (max-width: 768px) {
    .question-display {
      padding: 1rem;
      margin: 0;
    }

    .question-header {
      margin-bottom: 1.5rem;
    }

    .question-text {
      margin-bottom: 2rem;
    }

    .question-text h2 {
      font-size: 1.3rem;
      line-height: 1.3;
    }

    .options-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .option-button {
      padding: 1rem 0.75rem;
      font-size: 0.95rem;
    }
    
    .option-text {
      line-height: 1.2;
    }
  }
  
  @media (max-width: 480px) {
    .question-display {
      padding: 0.75rem;
    }
    
    .question-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    
    .difficulty-badge,
    .points {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }
    
    .question-text h2 {
      font-size: 1.1rem;
    }
    
    .option-button {
      padding: 0.75rem;
      gap: 0.75rem;
    }
    
    .option-letter {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }
    
    .option-text {
      font-size: 0.9rem;
    }
  }
</style>
