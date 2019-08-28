<script>
  export let board;

  const dim = board.dim;
</script>

<div class={`board board-${board.size}`}>
  {#each board.rows() as row}
    {#each row as item}
      <div
        class={`cell ${item.y % dim === dim - 1 ? 'region-y' : ''} ${item.x % dim === dim - 1 ? 'region-x' : ''}`}>
        <span class="value">{item.solvedValue || `(${item.value})`}</span>
      </div>
    {/each}
  {/each}
</div>
