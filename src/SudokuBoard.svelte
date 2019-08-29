<script>
  export let board;
  export let dim;

  const DEBUG = true;
</script>

{#if !board}

{:else}
  <div class={`board board-${board.size}`}>
    {#each board.rows() as row}
      {#each row as item}
        <div
          class={`cell ${item.y % dim === dim - 1 ? 'region-y' : ''} ${item.x % dim === dim - 1 ? 'region-x' : ''}`}
          title={DEBUG ? `(${item.x},${item.y}) solved: ${item.isSolved()}; value: ${item.value}; solvedValue: ${item.solvedValue}; candidates: ${JSON.stringify(item.candidates)}` : ''}>
          <span class="value">
            {item.solvedValue || (DEBUG ? `(${item.value})` : '')}
          </span>
        </div>
      {/each}
    {/each}
  </div>
{/if}
