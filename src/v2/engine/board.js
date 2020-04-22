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
    candidates: Array.from({ length: SIZE * SIZE * SIZE }).map(() => EMPTY),
  }
}

const sum = (a, c) => a + c

const boxStartIndex = (i) => (Math.floor(i / DIM) * SIZE + (i % DIM)) * DIM

const get = {
  [ROW]: (b, i) => b.data.substring(i * SIZE, i * SIZE + SIZE),
  [COL]: (b, i) => INDEXES.map((x) => b.data.charAt(x * SIZE + i)).reduce(sum),
  [BOX]: (b, i) => {
    const start = boxStartIndex(i)
    return (
      b.data.substring(start, start + DIM) +
      b.data.substring(start + SIZE, start + SIZE + DIM) +
      b.data.substring(start + 2 * SIZE, start + 2 * SIZE + DIM)
    )
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
}
