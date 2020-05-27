import { EMPTY, GROUPS, SIZE, get, realIndexTo, DIM } from './board'

const isSolved = (board) => board.data.indexOf(EMPTY) === -1

const isValidNonet = (nonet) => {
  const acc = {}
  for (let i = 0; i < nonet.length; ++i) {
    if (nonet[i] !== EMPTY) {
      if (!acc[nonet[i]]) {
        acc[nonet[i]] = 0
      }
      if (++acc[nonet[i]] > 1) {
        return false
      }
    }
  }
  return true
}

const isValidBoard = (board) => {
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const group = get[GROUPS[g]](board, i)
      if (!isValidNonet(group)) {
        return false
      }
    }
  }
  return true
}

// TODO might need optimization within bruteSolve
const isValidAt = (board, realIndex) => {
  const ref = board.data[realIndex]
  const col = realIndex % SIZE
  const row = Math.floor(realIndex / SIZE)
  const indexes = { [realIndex]: true }
  for (let i = 0; i < SIZE; ++i) {
    const i1 = row * SIZE + i
    if (indexes[i1]) {
      continue
    }
    indexes[i1] = true
    const i2 = i * SIZE + col
    if (indexes[i2]) {
      continue
    }
    indexes[i2] = true
    const val = board.data[i1]
    if (val && ref === val) {
      return false
    }
    const val2 = board.data[i2]
    if (val2 && ref === val2) {
      return false
    }
  }

  const boxStart =
    Math.floor(row / DIM) * (3 * SIZE) + Math.floor(col / DIM) * DIM

  for (let j = 0; j < DIM; ++j) {
    for (let i = 0; i < DIM; ++i) {
      const i1 = boxStart + j * SIZE + i
      if (indexes[i1]) {
        continue
      }
      indexes[i1] = true
      const val = board.data[i1]
      if (val && ref === val) {
        return false
      }
    }
  }

  /*for (let g = 0; g < GROUPS.length; ++g) {
    const i = realIndexTo(g, realIndex)
    const group = get[GROUPS[g]](board, i)
    if (!isValidNonet(group)) {
      return false
    }
  }*/
  return true
}

export { isValidAt, isValidBoard, isValidNonet, isSolved }
