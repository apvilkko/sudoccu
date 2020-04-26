import { EMPTY, SIZE, ROW, get, COL, BOX, CHOICES, DIM } from './board'

const getCandidatesAt = (data, i) => {
  const value = data[i] || EMPTY
  const board = { data }
  let candidates = null
  if (value === EMPTY) {
    const rowIndex = Math.floor(i / SIZE)
    const colIndex = i % SIZE
    const row = get[ROW](board, rowIndex)
    const col = get[COL](board, colIndex)
    const box = get[BOX](
      board,
      Math.floor(rowIndex / DIM) * DIM + Math.floor(colIndex / DIM)
    )
    const combo = row + col + box
    candidates = CHOICES.filter((x) => combo.indexOf(x) === -1).map((x) =>
      parseInt(x)
    )
  }
  return candidates
}

const updateCandidates = (board) => {
  for (let i = 0; i < board.data.length; ++i) {
    board.candidates[i] = getCandidatesAt(board.data, i)
  }
}

export { getCandidatesAt, updateCandidates }
