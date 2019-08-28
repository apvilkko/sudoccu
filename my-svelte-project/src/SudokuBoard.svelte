<script>
  export let board;
</script>

<div class="board">
  {#each Array.from({ length: board.size() }) as a, i}
    {#each board.row(i) as item}
      <div
        class={`cell ${item.y % 3 === 2 ? 'region-y' : ''} ${item.x % 3 === 2 ? 'region-x' : ''}`}>
        <span class="value">{item.value}</span>
      </div>
    {/each}
  {/each}
</div>
