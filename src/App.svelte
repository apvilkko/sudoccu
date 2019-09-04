<script>
  import { onMount } from "svelte";
  import Board from "./engine/Board";
  import SudokuBoard from "./SudokuBoard.svelte";
  import createStore from "./board/store";
  import { getBoard, getDim } from "./board/selectors";
  import { INIT } from "./board/actions/constants";
  import { randomizePuzzle } from "./board/generate";

  let store, board;
  let loading = false;
  let difficulty = 0;
  let desiredDifficulty = 10;
  let steps = null;
  let generateFn;

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

  const generate = store => {
    loading = true;
    randomizePuzzle(store, desiredDifficulty).then(
      ({ difficulty: puzzleDifficulty, steps: solutionSteps }) => {
        board = getBoard(store.getState());
        difficulty = puzzleDifficulty;
        loading = false;
        steps = solutionSteps;
      }
    );
  };

  onMount(() => {
    store = createStore();
    store.dispatch({ type: INIT });
    board = getBoard(store.getState());
    generate(store);
  });
</script>

<div class="container">
  <h1>Sudoccu</h1>
  <div>
    <button on:click={() => generate(store)} disabled={loading}>
      Generate
    </button>
    <label>
      Difficulty:
      <input type="number" bind:value={desiredDifficulty} />
    </label>
  </div>
  {#if loading}
    <p>Generating, please wait</p>
  {:else}
    <div class="board-container">
      <SudokuBoard {board} dim={store ? getDim(store.getState()) : null} />
    </div>
    <p>Difficulty: {difficulty}</p>
    <pre>{formatSteps(steps)}</pre>
  {/if}

</div>
