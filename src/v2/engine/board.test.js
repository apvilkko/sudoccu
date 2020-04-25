import testcases from '../../testcases'
import board, { get, ROW, COL, BOX, realIndexTo } from './board'

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
