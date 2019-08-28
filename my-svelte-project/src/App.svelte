<script>
  import { initBoard } from "./engine/logic";
  import SudokuBoard from "./SudokuBoard.svelte";
  let board = initBoard();

  const generate = () => {
    board.randomize();
    board = board;
  };
</script>

<div>
  <h1>Sudoccu</h1>
  <button on:click={generate}>Generate</button>
  <SudokuBoard {board} />
</div>
