import * as R from 'ramda'
import {
  EMPTY,
  ROW,
  get,
  COL,
  BOX,
  CHOICES,
  realIndexTo,
  SIZE,
  DIM,
} from './board'

const sees = (data, i) => {
  const rowIndex = realIndexTo(ROW, i)
  const colIndex = realIndexTo(COL, i)
  const boxIndex = realIndexTo(BOX, i)
  const board = { data }
  const row = get[ROW](board, rowIndex)
  const col = get[COL](board, colIndex)
  const box = get[BOX](board, boxIndex)
  const combo = row + col + box
  return combo
}

/*const STARTING_CHOICES = CHOICES.reduce((acc, curr) => {
  acc[curr] = true
  return acc
}, {})*/

const getCandidatesAt = (data, realIndex) => {
  const value = data[realIndex] || EMPTY
  if (value !== EMPTY) {
    return null
  }

  /*const candidates = { ...STARTING_CHOICES }
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
    const val = data[i1]
    if (val && val !== EMPTY) {
      delete candidates[val]
    }
    const val2 = data[i2]
    if (val2 && val2 !== EMPTY) {
      delete candidates[val2]
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
      const val = data[i1]
      if (val && val !== EMPTY) {
        delete candidates[val]
      }
    }
  }

  return Object.keys(candidates).map((x) => parseInt(x, 10))*/

  const combo = sees(data, realIndex)
  return CHOICES.filter((x) => combo.indexOf(x) === -1).map((x) => parseInt(x))
}

const getNumberOfOccurrences = (candidates) => {
  const ret = {}
  candidates.forEach((candArr, i) => {
    if (candArr) {
      candArr.forEach((cand) => {
        if (!ret[cand]) {
          ret[cand] = { value: cand, at: [] }
        }
        ret[cand].at.push(i)
      })
    }
  })
  return ret
}

const getUniqueCandidates = (candidates) =>
  R.uniq(
    candidates
      .flatMap((x) => x)
      .filter((x) => x != null)
      .sort()
  )

const updateCandidates = (board, initial = false) => {
  if (initial) {
    for (let i = 0; i < board.data.length; ++i) {
      board.candidates[i] = getCandidatesAt(board.data, i)
    }
  } else {
    for (let i = 0; i < board.data.length; ++i) {
      if (board.data[i] !== EMPTY) {
        board.candidates[i] = null
      } else {
        const combo = sees(board.data, i)
        const solved = CHOICES.filter((x) => combo.indexOf(x) > -1).map((x) =>
          parseInt(x)
        )
        board.candidates[i] = board.candidates[i].filter(
          (x) => !solved.includes(x)
        )
      }
    }
  }
}

export {
  getCandidatesAt,
  updateCandidates,
  getUniqueCandidates,
  getNumberOfOccurrences,
}
