<script>
  import { onMount } from "svelte";
  import { getDim, getHighlight, getBoard } from "./board/selectors";
  import { getRows } from "./board/actions/board";
  import { isSolved, getCandidates } from "./board/actions/cell";

  export let handleCellClick;
  export let store;
  export let state;

  let size;
  let dim;
  let board;
  let highlight = {};
  let hl = {};
  $: board = getBoard(state);
  $: {
    highlight = getHighlight(state);
    hl = {
      on: highlight.x >= 0
    };
    console.log(highlight);
  }
  const DEBUG = false;

  const isValueHighlight = item =>
    hl.on && highlight.value === item.solvedValue;

  const isCandidateHighlight = item =>
    hl.on && getCandidates(item).includes(highlight.value);

  onMount(() => {
    dim = getDim(store.getState());
    size = dim * dim;
  });
</script>

{#if !board}
  <div />
{:else}
  <table class={`board board-${size}`}>
    {#each getRows(size)(board) as row}
      <tr class="row">
        {#each row as item}
          <td
            class="cell"
            class:highlight={hl.on && item.x === highlight.x && item.y === highlight.y}
            class:highlight-block={hl.on && (item.x === highlight.x || item.y === highlight.y)}
            class:highlight-match={isValueHighlight(item) || isCandidateHighlight(item)}
            class:region-x={item.x % dim === dim - 1}
            class:region-y={item.y % dim === dim - 1}
            title={DEBUG ? `(${item.x},${item.y}) solved: ${isSolved(item)}; value: ${item.value}; solvedValue: ${item.solvedValue}; candidates: ${JSON.stringify(item.candidates)}` : ''}
            on:click={() => handleCellClick(item)}>
            <div class="cell-container">
              <span class="value">
                {item.solvedValue || (DEBUG ? `(${item.value})` : '')}
              </span>
              {#if !item.solvedValue}
                {#each item.candidates as candidate}
                  <span
                    class={`candidate candidate-${candidate}`}
                    class:highlight-candidate={hl.on && highlight.value === candidate}>
                    {candidate}
                  </span>
                {/each}
              {/if}
            </div>
          </td>
        {/each}
      </tr>
    {/each}
  </table>
{/if}
