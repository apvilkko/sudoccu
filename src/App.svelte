<script>
  import { onMount } from "svelte";
  import Board from "./engine/Board";
  import SudokuBoard from "./SudokuBoard.svelte";
  import createStore from "./board/store";
  import { getBoard, getDim, getSize } from "./board/selectors";
  import {
    INIT,
    UPDATE_CANDIDATES,
    APPLY_STEPS,
    HIGHLIGHT
  } from "./board/actions/constants";
  import { updateCandidates } from "./board/actions/board";
  import { randomizePuzzle } from "./board/generate";
  import { solve } from "./engine/solver";
  import { isSolved as isCellSolved } from "./board/actions/cell";
  import formatSteps from "./formatSteps";

  let store, board, state;
  let loading = false;
  let difficulty = 0;
  let desiredDifficulty = 42;
  let steps = null;
  let generateFn;
  let error = null;

  const generate = () => {
    loading = true;
    randomizePuzzle(store, desiredDifficulty)
      .then(({ difficulty: puzzleDifficulty, steps: solutionSteps }) => {
        store.dispatch({ type: UPDATE_CANDIDATES });
        state = store.getState();
        difficulty = puzzleDifficulty;
        loading = false;
        steps = solutionSteps;
        error = null;
      })
      .catch(err => {
        // loading = false;
        error = err;
        setTimeout(() => {
          generate();
        }, 100);
      });
  };

  const updateSteps = () => {
    const state = store.getState();
    steps = solve(getSize(state))(getBoard(state));
  };

  const applyNextStep = () => {
    updateSteps();
    if (steps && steps.length > 0) {
      store.dispatch({ type: HIGHLIGHT, payload: { cell: {} } });
      store.dispatch({ type: APPLY_STEPS, payload: steps.slice(0, 1) });
      store.dispatch({ type: UPDATE_CANDIDATES });
      state = store.getState();
    }
    setTimeout(() => {
      updateSteps();
    }, 100);
  };

  const handleCellClick = cell => {
    if (isCellSolved(cell)) {
      store.dispatch({ type: HIGHLIGHT, payload: { cell } });
    } else {
    }
    state = store.getState();
  };

  onMount(() => {
    store = createStore();
    store.dispatch({ type: INIT });
    state = store.getState();
    generate();
  });
</script>

{#if store}
  <div class="container">
    <h1>Sudoccu</h1>
    <div class="layout">
      <div>
        {#if loading}
          <p>Generating, please wait</p>
        {:else if error !== null}
          <p>{error}</p>
        {:else}
          <div class="board-container">
            <SudokuBoard {store} {state} {handleCellClick} />
          </div>
        {/if}
      </div>
      <div>
        <div class="controls">
          <button on:click={generate} disabled={loading}>Generate</button>
          <button on:click={applyNextStep} disabled={loading}>
            Apply next step
          </button>
          <label>
            Difficulty:
            <input type="number" bind:value={desiredDifficulty} />
          </label>
        </div>
        <p>Difficulty: {difficulty}</p>
        <div class="steps">
          {#each formatSteps(steps).split('\n') as step}
            {step}
            <br />
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
