<script>
  import { onMount } from "svelte";
  import Board from "./engine/Board";
  import SudokuBoard from "./SudokuBoard.svelte";
  import createStore from "./board/store";
  import { getBoard, getDim, getSize } from "./board/selectors";
  import {
    INIT,
    UPDATE_CANDIDATES,
    APPLY_STEPS
  } from "./board/actions/constants";
  import { updateCandidates } from "./board/actions/board";
  import { randomizePuzzle } from "./board/generate";
  import { solve } from "./engine/solver";

  let store, board;
  let loading = false;
  let difficulty = 0;
  let desiredDifficulty = 35;
  let steps = null;
  let generateFn;
  let error = null;

  const coord = item => `${String.fromCharCode(0x41 + item.y)}${item.x + 1}`;

  const formatSteps = steps => {
    return steps
      ? steps
          .map((step, i) => {
            const title = `${i + 1}: ${step.type}: `;
            let data = "";
            if (step.solved) {
              data += step.solved.map(
                solved => `${solved.value} at ${coord(solved)}`
              );
            }
            if (step.tuple) {
              data += `${step.tuple} `;
            }
            if (step.eliminations) {
              data += `because of ${step.cause
                .map(a => `${coord(a)}`)
                .join(", ")} eliminate ${step.eliminations
                .map(
                  elimination =>
                    `${JSON.stringify(
                      elimination.eliminatedCandidates
                    )} at ${coord(elimination)}`
                )
                .join(", ")}`;
            }
            /* `${step.cell.value} at (${step.cell.x},${
                step.cell.y
              })` */
            return title + data;
          })
          .join("\n")
      : "";
  };

  const generate = () => {
    loading = true;
    randomizePuzzle(store, desiredDifficulty)
      .then(({ difficulty: puzzleDifficulty, steps: solutionSteps }) => {
        store.dispatch({ type: UPDATE_CANDIDATES });
        board = getBoard(store.getState());
        difficulty = puzzleDifficulty;
        loading = false;
        steps = solutionSteps;
        error = null;
      })
      .catch(err => {
        loading = false;
        error = err;
        setTimeout(() => {
          generate();
        }, 200);
      });
  };

  const updateSteps = () => {
    const state = store.getState();
    steps = solve(getSize(state))(getBoard(state));
  };

  const applyNextStep = () => {
    console.log("-> applyNextStep");
    console.log("steps HEAD is ", JSON.stringify(steps[0]));
    updateSteps();
    console.log("steps HEAD is ", JSON.stringify(steps[0]));
    if (steps && steps.length > 0) {
      console.log("APPLY_STEPS", steps.slice(0, 1));
      store.dispatch({ type: APPLY_STEPS, payload: steps.slice(0, 1) });
    }
    console.log("steps HEAD is ", JSON.stringify(steps[0]));
    board = getBoard(store.getState());
    console.log("steps HEAD is ", JSON.stringify(steps[0]));
    setTimeout(() => {
      updateSteps();
    }, 200);
    console.log("<- applyNextStep");
  };

  onMount(() => {
    store = createStore();
    store.dispatch({ type: INIT });
    board = getBoard(store.getState());
    generate();
  });
</script>

<div class="container">
  <h1>Sudoccu</h1>
  <div>
    <button on:click={generate} disabled={loading}>Generate</button>
    <button on:click={applyNextStep} disabled={loading}>Apply next step</button>
    <label>
      Difficulty:
      <input type="number" bind:value={desiredDifficulty} />
    </label>
  </div>
  {#if loading}
    <p>Generating, please wait</p>
  {:else if error !== null}
    <p>{error}</p>
  {:else}
    <div class="board-container">
      <SudokuBoard {board} dim={store ? getDim(store.getState()) : null} />
    </div>
    <p>Difficulty: {difficulty}</p>
    <pre>{formatSteps(steps)}</pre>
  {/if}

</div>
