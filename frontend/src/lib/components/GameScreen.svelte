<script lang="ts">
  import { gameState, timeRemaining, questionResults, sortedPlayers, gameActions, currentPlayer } from '../stores/game';
  import Leaderboard from './Leaderboard.svelte';
  import QuestionDisplay from './QuestionDisplay.svelte';
  import Timer from './Timer.svelte';
  import AnswerEffects from './AnswerEffects.svelte';
  import AnswerFeedback from './AnswerFeedback.svelte';
  import WinnerCelebration from './WinnerCelebration.svelte';

  let selectedAnswer: number | null = null;
  let showEffect: boolean = false;
  let lastCorrectAnswer: boolean = false;

  function handleAnswerSelect(option: number) {
    if ($gameState.phase === 'question' && selectedAnswer === null) {
      selectedAnswer = option;
      gameActions.answerQuestion(option);
    }
  }

  // Reset selected answer when new question starts
  $: if ($gameState.phase === 'question' && $gameState.currentQuestion) {
    selectedAnswer = null;
    showEffect = false;
  }

  // Show effects when question ends
  $: if ($gameState.phase === 'results' && $questionResults && $currentPlayer && selectedAnswer !== null) {
    const wasCorrect = selectedAnswer === $questionResults.correctAnswer;
    lastCorrectAnswer = wasCorrect;
    showEffect = true;
    
    // Hide effect after a short delay
    setTimeout(() => {
      showEffect = false;
    }, 3000);
  }
</script>

<div class="game-screen">
  <div class="game-header">
    <div class="game-progress">
      <span class="question-number">Question {$gameState.questionIndex + 1}</span>
      {#if $gameState.currentQuestion}
        <span class="category">{$gameState.currentQuestion.category}</span>
      {/if}
    </div>
    <div class="timer-container">
      <Timer />
    </div>
  </div>

  <div class="game-content">
    <div class="main-area">
      {#if $gameState.phase === 'question' && $gameState.currentQuestion}
        <QuestionDisplay 
          question={$gameState.currentQuestion} 
          {selectedAnswer}
          onSelect={handleAnswerSelect}
          disabled={selectedAnswer !== null}
        />
      {:else if $gameState.phase === 'results' && $questionResults}
        <div class="results-screen">
          <div class="results-header">
            <h2>Results</h2>
            {#if $gameState.currentQuestion}
              <p class="correct-answer">
                Correct answer: <strong>{$gameState.currentQuestion.options[$questionResults.correctAnswer]}</strong>
              </p>
            {/if}
          </div>

          <div class="answer-breakdown">
            {#if $gameState.currentQuestion}
              {#each $gameState.currentQuestion.options as option, index}
                <div class="answer-option" class:correct={index === $questionResults.correctAnswer}>
                  <span class="option-text">{option}</span>
                  <div class="player-answers">
                    {#each $questionResults.playerAnswers.filter(pa => pa.answer === index) as playerAnswer}
                      {@const player = $gameState.players.find(p => p.id === playerAnswer.playerId)}
                      {#if player}
                        <span class="player-badge" class:correct-player={index === $questionResults.correctAnswer}>
                          {player.name}
                        </span>
                      {/if}
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}
          </div>

          <div class="next-indicator">
            <p>Next question starting soon...</p>
          </div>
        </div>
      {:else if $gameState.phase === 'finished'}
        <div class="game-finished">
          <h2>🎉 Game Complete!</h2>
          <p>Thanks for playing AI Vocab Quiz!</p>
          
          <div class="final-winner">
            {#if $sortedPlayers.length > 0}
              <h3>🏆 Winner: {$sortedPlayers[0].name}</h3>
              <p>Final Score: {$sortedPlayers[0].score} points</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="sidebar">
      <Leaderboard players={$sortedPlayers} />
    </div>
  </div>
</div>

<!-- Answer effects overlay -->
<AnswerEffects show={showEffect} correct={lastCorrectAnswer} />

<!-- Big answer feedback -->
<AnswerFeedback show={showEffect} correct={lastCorrectAnswer} />

<!-- Epic winner celebration for current player -->
{#if $gameState.phase === 'finished' && $sortedPlayers.length > 0 && $currentPlayer && $sortedPlayers[0].id === $currentPlayer.id}
  <WinnerCelebration show={true} playerName={$sortedPlayers[0].name} />
{/if}

<style>
  .game-screen {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .game-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .category {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.9rem;
  }

  .game-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1rem;
    flex: 1;
    min-height: 0;
  }

  .main-area {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .results-screen {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    max-width: 600px;
    width: 100%;
  }

  .results-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .results-header h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .correct-answer {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .answer-breakdown {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .answer-option {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 10px;
    border: 2px solid transparent;
  }

  .answer-option.correct {
    border-color: #4ade80;
    background: rgba(74, 222, 128, 0.2);
  }

  .option-text {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }

  .player-answers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .player-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .player-badge.correct-player {
    background: rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }

  .next-indicator {
    text-align: center;
    font-style: italic;
    opacity: 0.8;
  }

  .game-finished {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }

  .game-finished h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .final-winner {
    margin-top: 2rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
  }

  .final-winner h3 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    .game-content {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }
    
    .sidebar {
      order: 2;
    }
  }

  @media (max-width: 768px) {
    .game-screen {
      padding: 0.5rem;
      min-height: 100vh;
      height: auto;
      overflow-y: auto;
    }
    
    .game-header {
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 10;
    }
    
    .game-progress {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .game-content {
      gap: 0.5rem;
      display: block;
      flex: none;
      min-height: auto;
    }
    
    .main-area {
      align-items: flex-start;
      padding-top: 1rem;
      margin-bottom: 1rem;
    }
    
    .sidebar {
      position: relative;
      z-index: 5;
    }
  }
</style>
