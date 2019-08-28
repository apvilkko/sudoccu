<script>
  import { onMount } from "svelte";
  import Board from "./engine/Board";
  import SudokuBoard from "./SudokuBoard.svelte";
  let board = new Board();
  let loading = false;

  const generate = () => {
    loading = true;
    board.randomize().then(() => {
      board = board;
      loading = false;
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
  </div>
  {#if loading}
    <p>Generating, please wait</p>
  {:else}
    <div class="board-container">
      <SudokuBoard {board} />
    </div>
  {/if}

</div>
