<script>
  import { onMount } from "svelte";
  import Board from "./engine/Board";
  import SudokuBoard from "./SudokuBoard.svelte";
  let board = new Board();
  let loading = false;
  let difficulty = 0;
  let desiredDifficulty = 10;
  let steps = null;

  const formatSteps = steps => {
    return steps
      ? steps
          .map(
            (step, i) =>
              `${i + 1}: ${step.type}: ${step.cell.value} at (${step.cell.x},${
                step.cell.y
              })`
          )
          .join("\n")
      : "";
  };

  const generate = () => {
    loading = true;
    board
      .randomizePuzzle(desiredDifficulty)
      .then(({ difficulty: puzzleDifficulty, steps: solutionSteps }) => {
        board = board;
        difficulty = puzzleDifficulty;
        loading = false;
        steps = solutionSteps;
      });
  };

  onMount(() => {
    generate();
  });
</script>

<div class="container">
  <h1>Sudoccu</h1>
  <div>
    <button on:click={generate} disabled={loading}>Generate</button>
    <label>
      Difficulty:
      <input type="number" bind:value={desiredDifficulty} />
    </label>
  </div>
  {#if loading}
    <p>Generating, please wait</p>
  {:else}
    <div class="board-container">
      <SudokuBoard {board} />
    </div>
    <p>Difficulty: {difficulty}</p>
    <pre>{formatSteps(steps)}</pre>
  {/if}

</div>
