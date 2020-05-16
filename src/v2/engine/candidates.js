import * as R from 'ramda'
import { EMPTY, ROW, get, COL, BOX, CHOICES, realIndexTo } from './board'

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

const getCandidatesAt = (data, i) => {
  const value = data[i] || EMPTY
  let candidates = null
  if (value === EMPTY) {
    const combo = sees(data, i)
    candidates = CHOICES.filter((x) => combo.indexOf(x) === -1).map((x) =>
      parseInt(x)
    )
  }
  return candidates
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
