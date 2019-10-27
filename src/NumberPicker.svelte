<script>
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  export let pencil;
  export let handleAction;
</script>

<div class="number-picker">
  {#each numbers as number}
    <button on:click={() => handleAction(number)}>{number}</button>
  {/each}
  <button
    class="pencil"
    class:active={pencil}
    on:click={() => handleAction('pencil')}>
    ✎
  </button>
  <button on:click={() => handleAction('undo')}>⌫</button>
</div>
