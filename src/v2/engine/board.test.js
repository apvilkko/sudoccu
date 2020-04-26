import testcases from '../../testcases'
import board, { get, ROW, COL, BOX, realIndexTo, SIZE } from './board'

describe('get', () => {
  it('row works', () => {
    const data = testcases.TEST_SOLVED
    expect(get[ROW](board(data), 0)).toEqual('629543817')
    expect(get[ROW](board(data), 8)).toEqual('967358142')
  })

  it('col works', () => {
    const data = testcases.TEST_SOLVED
    expect(get[COL](board(data), 1)).toEqual('253719486')
    expect(get[COL](board(data), 7)).toEqual('192386574')
  })

  it('box works', () => {
    const data = testcases.TEST_SOLVED
    expect(get[BOX](board(data), 1)).toEqual('543762891')
    expect(get[BOX](board(data), 6)).toEqual('241583967')
  })
})

const cands = Array.from({ length: SIZE * SIZE }).map((_, i) =>
  i % 8 === 0 ? null : i % 7 === 0 ? [i + 1, 9] : [i]
)

/*console.log(
  cands
    .map((x, i) =>
      (i + 1) % SIZE === 0 ? `${x}\n` : x === null ? 'null ' : `${x} `
    )
    .join('')
)*/

const candBoard = { candidates: cands }

describe('get cands', () => {
  it('row works', () => {
    expect(get[ROW](candBoard, 0, true)).toEqual([
      null,
      [1],
      [2],
      [3],
      [4],
      [5],
      [6],
      [8, 9],
      null,
    ])
    expect(get[ROW](candBoard, 8, true)).toEqual([
      null,
      [73],
      [74],
      [75],
      [76],
      [78, 9],
      [78],
      [79],
      null,
    ])
  })

  it('col works', () => {
    expect(get[COL](candBoard, 1, true)).toEqual([
      [1],
      [10],
      [19],
      [29, 9],
      [37],
      [46],
      [55],
      null,
      [73],
    ])
    expect(get[COL](candBoard, 7, true)).toEqual([
      [8, 9],
      null,
      [25],
      [34],
      [43],
      [52],
      [61],
      [71, 9],
      [79],
    ])
  })

  it('box works', () => {
    expect(get[BOX](candBoard, 1, true)).toEqual([
      [3],
      [4],
      [5],
      [12],
      [13],
      [15, 9],
      [22, 9],
      [22],
      [23],
    ])
    expect(get[BOX](candBoard, 6, true)).toEqual([
      [54],
      [55],
      null,
      [64, 9],
      null,
      [65],
      null,
      [73],
      [74],
    ])
  })
})

describe('realIndexTo', () => {
  it('works', () => {
    expect(realIndexTo(ROW, 6)).toEqual(0)
    expect(realIndexTo(COL, 6)).toEqual(6)
    expect(realIndexTo(BOX, 6)).toEqual(2)
    expect(realIndexTo(ROW, 29)).toEqual(3)
    expect(realIndexTo(COL, 29)).toEqual(2)
    expect(realIndexTo(BOX, 29)).toEqual(3)
    expect(realIndexTo(ROW, 80)).toEqual(8)
    expect(realIndexTo(COL, 80)).toEqual(8)
    expect(realIndexTo(BOX, 80)).toEqual(8)
  })
})
