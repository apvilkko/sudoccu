import testcases from '../../testcases'
import board, { get, ROW, COL, BOX } from './board'

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
