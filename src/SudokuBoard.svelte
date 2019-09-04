<script>
  import { onMount } from "svelte";
  import { getRows } from "./board/actions/board";
  import { isSolved } from "./board/actions/cell";

  export let board;
  export let dim;

  let size;
  const DEBUG = true;

  onMount(() => {
    size = dim * dim;
  });
</script>

{#if !board}

{:else}
  <div class={`board board-${size}`}>
    {#each getRows(size)(board) as row}
      {#each row as item}
        <div
          class={`cell ${item.y % dim === dim - 1 ? 'region-y' : ''} ${item.x % dim === dim - 1 ? 'region-x' : ''}`}
          title={DEBUG ? `(${item.x},${item.y}) solved: ${isSolved(item)}; value: ${item.value}; solvedValue: ${item.solvedValue}; candidates: ${JSON.stringify(item.candidates)}` : ''}>
          <span class="value">
            {item.solvedValue || (DEBUG ? `(${item.value})` : '')}
          </span>
        </div>
      {/each}
    {/each}
  </div>
{/if}
