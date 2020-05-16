const ROW = 0
const COL = 1
const BOX = 2
const GROUPS = [ROW, COL, BOX]

const DIM = 3
const SIZE = DIM * DIM
const INDEXES = Array.from({ length: SIZE }).map((_, i) => i)
const CHOICES = INDEXES.map((x) => x + 1 + '')
const EMPTY = '.'

const cleanData = (data) => data.replace(/\s+/g, '').replace(/[^\d.]/, EMPTY)

const board = (data = '') => {
  return {
    data: cleanData(data),
    candidates: Array.from({ length: SIZE * SIZE }).map(() => null),
  }
}

const toArray = (a) => (a === null ? a : Array.isArray(a) ? a : [a])

const sumFns = {
  sum: (a, c) => a + c,
  arrSum: (a, c) => (a || []).concat(c || []),
  arrPush: (a, c) => {
    const arr = a || []
    arr.push(toArray(c))
    return arr
  },
}

const boxStartIndex = (i) => (Math.floor(i / DIM) * SIZE + (i % DIM)) * DIM

const key = (cands) => (cands ? 'candidates' : 'data')
const fn = (cands) => (cands ? 'slice' : 'substring')
const atFn = (cands) => (cands ? 'get' : 'charAt')
const sumFn = (cands) => (cands ? 'arrSum' : 'sum')

Array.prototype.get = function (i) {
  return this[i]
}

const DIMS = Array.from({ length: DIM }).map((_, i) => i)

const realIndexTo = (key, i) => {
  switch (key) {
    case COL:
      return i % SIZE
    case ROW:
      return Math.floor(i / SIZE)
    default:
      return (
        Math.floor(Math.floor(i / SIZE) / DIM) * DIM +
        Math.floor((i % SIZE) / DIM)
      )
  }
}

const get = {
  [ROW]: (b, i, cands) => {
    const index = i * SIZE
    return b[key(cands)][fn(cands)](index, index + SIZE)
  },
  [COL]: (b, i, cands) => {
    const sumFunc = cands ? sumFns.arrPush : sumFns[sumFn(cands)]
    const initial = cands ? [] : ''
    const data = key(cands)
    const at = atFn(cands)
    return INDEXES.map((x) => b[data][at](x * SIZE + i)).reduce(
      sumFunc,
      initial
    )
  },
  [BOX]: (b, i, cands) => {
    const start = boxStartIndex(i)
    const sumFunc = sumFns[sumFn(cands)]
    const data = key(cands)
    const func = fn(cands)
    return DIMS.map((x) =>
      b[data][func](start + x * SIZE, start + x * SIZE + DIM)
    ).reduce(sumFunc)
  },
}

const replaceInData = (data, i, val) =>
  data.substring(0, i) + val + data.substring(i + 1)

const toRealIndex = (indexWithinGroup, groupType, groupIndex) => {
  if (groupType === ROW) {
    return groupIndex * SIZE + indexWithinGroup
  } else if (groupType === COL) {
    return indexWithinGroup * SIZE + groupIndex
  }
  const start = boxStartIndex(groupIndex)
  const addLines = Math.floor(indexWithinGroup / DIM)
  return start + addLines * SIZE + (indexWithinGroup % DIM)
}

const setValueToBoard = (board, realIndex, value) => {
  board.data =
    board.data.substring(0, realIndex) +
    value +
    board.data.substring(realIndex + 1)
}

const getRealIndex = (x, y) => y * SIZE + x

const setValueToBoardXy = (board, x, y, value) =>
  setValueToBoard(board, getRealIndex(x, y), value)

const getBoardValue = (board, x, y) => board.data[getRealIndex(x, y)]

const setCandidatesAt = (candidates, x, y, newCands) => {
  const realIndex = getRealIndex(x, y)
  return [
    ...candidates.slice(0, realIndex),
    newCands,
    ...candidates.slice(realIndex + 1),
  ]
}

export {
  board as default,
  get,
  ROW,
  COL,
  BOX,
  GROUPS,
  SIZE,
  DIM,
  EMPTY,
  boxStartIndex,
  CHOICES,
  realIndexTo,
  cleanData,
  replaceInData,
  INDEXES,
  toRealIndex,
  setValueToBoard,
  setValueToBoardXy,
  getBoardValue,
  setCandidatesAt,
}
