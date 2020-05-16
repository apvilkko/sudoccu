<script>
  import { onMount } from 'svelte'
  import { getDim, getHighlight, getBoard } from './board/selectors'
  import { getRows } from './board/actions/board'
  import { isSolved, getCandidates } from './board/actions/cell'
  import { INDEXES, get, ROW, EMPTY, getBoardValue } from './v2/engine/board'

  export let handleCellClick
  export let store
  export let state

  let playerBoard
  let size
  let dim
  let board
  let highlight = {}
  let hl = {}
  let rows = []
  let candidates = []
  $: {
    board = getBoard(state)
    playerBoard = board.playerBoard
    highlight = getHighlight(state)
    hl = {
      on: highlight.x >= 0
    }
    if (board && board.playerBoard) {
      rows = INDEXES.map(i => get[ROW](playerBoard, i).split(''))
      candidates = INDEXES.map(i =>
        get[ROW](playerBoard, i, true).map(x => (x === null ? [] : x))
      )
    }
  }
  const DEBUG = false

  const isValueHighlight = item => hl.on && highlight.value === Number(item)

  const isCandidateHighlight = (item, x, y) =>
    hl.on && candidates[y][x].includes(highlight.value)

  onMount(() => {
    dim = getDim(store.getState())
    size = dim * dim
  })
</script>

{#if !board}
  <div />
{:else}
  <table class={`board board-${size}`}>
    {#each rows as row, y}
      <tr class="row">
        {#each row as item, x}
          <td
            class="cell"
            class:highlight={hl.on && x === highlight.x && y === highlight.y}
            class:highlight-block={hl.on && (x === highlight.x || y === highlight.y)}
            class:highlight-match={isValueHighlight(item, x, y) || isCandidateHighlight(item, x, y)}
            class:region-x={x % dim === dim - 1}
            class:region-y={y % dim === dim - 1}
            class:highlight-error={item !== EMPTY && item !== getBoardValue(board.board, x, y)}
            title={DEBUG ? `(${x},${y}) solved: ${isSolved(item)}; value: ${item}; solvedValue: ${item.solvedValue}; candidates: ${JSON.stringify(item.candidates)} :: ${JSON.stringify(item)}` : ''}
            on:click={() => handleCellClick(item, x, y)}>
            <div class="cell-container">
              <span class="value">
                {item === EMPTY ? '' : item}
                <!-- {item.solvedValue || (DEBUG ? `(${item.value})` : '')} -->
              </span>
              {#if item === EMPTY}
                {#each candidates[y][x] as candidate}
                  <span
                    class={`candidate candidate-${candidate}`}
                    class:highlight-candidate={hl.on && highlight.value === candidate}>
                    {candidate}
                  </span>
                {/each}
              {/if}
              <!--
              {#if !item.solvedValue}
                {#each item.solvedCandidates as candidate}
                  <span
                    class={`candidate candidate-${candidate}`}
                    class:highlight-candidate={hl.on && highlight.value === candidate}>
                    {candidate}
                  </span>
                {/each}
              {/if}
              -->
            </div>
          </td>
        {/each}
      </tr>
    {/each}
  </table>
{/if}
