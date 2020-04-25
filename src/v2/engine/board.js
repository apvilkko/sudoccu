const ROW = 0
const COL = 1
const BOX = 2
const GROUPS = [ROW, COL, BOX]

const DIM = 3
const SIZE = DIM * DIM
const INDEXES = Array.from({ length: SIZE }).map((_, i) => i)
const CHOICES = INDEXES.map((x) => x + 1 + '')
const EMPTY = '.'

const board = (data = '') => {
  return {
    data: data.replace(/\s+/g, '').replace(/[^\d.]/, EMPTY),
    candidates: Array.from({ length: SIZE * SIZE }).map(() => null),
  }
}

const sumFns = {
  sum: (a, c) => a + c,
  arrSum: (a, c) => (a || []).concat(c || []),
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
    const sumFunc = sumFns[sumFn(cands)]
    const data = key(cands)
    const at = atFn(cands)
    return INDEXES.map((x) => b[data][at](x * SIZE + i)).reduce(sumFunc)
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
}
