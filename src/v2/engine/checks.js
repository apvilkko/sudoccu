import { EMPTY, GROUPS, SIZE, get, realIndexTo } from './board'

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

const isValidAt = (board, realIndex) => {
  for (let g = 0; g < GROUPS.length; ++g) {
    const i = realIndexTo(g, realIndex)
    const group = get[GROUPS[g]](board, i)
    if (!isValidNonet(group)) {
      return false
    }
  }
  return true
}

export { isValidAt, isValidBoard, isValidNonet, isSolved }
