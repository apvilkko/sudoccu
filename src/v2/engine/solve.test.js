import testcases from '../../testcases'
import solve, { toRealIndex } from './solve'
import board, { ROW, COL, BOX } from './board'

const cv = (coords, value) => (x) =>
  x.coords[0] === coords[0] && x.coords[1] == coords[1] && x.value === value

const stepN = (steps, coords, value) => steps.filter(cv(coords, value)).length

const typeIs = (type) => (x) => x.type === type

describe('toRealIndex', () => {
  it('works', () => {
    expect(toRealIndex(3, ROW, 0)).toEqual(3)
    expect(toRealIndex(2, ROW, 1)).toEqual(11)
    expect(toRealIndex(2, COL, 0)).toEqual(18)
    expect(toRealIndex(0, COL, 6)).toEqual(6)
    expect(toRealIndex(3, BOX, 0)).toEqual(9)
    expect(toRealIndex(8, BOX, 1)).toEqual(23)
    expect(toRealIndex(4, BOX, 2)).toEqual(16)
    expect(toRealIndex(2, BOX, 3)).toEqual(29)
    expect(toRealIndex(8, BOX, 8)).toEqual(80)
  })
})

describe('solve', () => {
  it('does nothing with solved board', () => {
    const data = testcases.TEST_SOLVED
    const { steps } = solve(board(data))
    expect(steps).toEqual([])
  })

  it('solves naked singles, simple', () => {
    const data = testcases.TEST_SINGLES_SIMPLE
    const { steps } = solve(board(data))
    //console.log('steps', steps)
    expect(steps.length).toEqual(3)
    expect(stepN(steps, [2, 0], 9)).toEqual(1)
    expect(stepN(steps, [7, 3], 3)).toEqual(1)
    expect(stepN(steps, [6, 6], 3)).toEqual(1)
  })

  it('solves hidden singles', () => {
    const data = testcases.TEST_HIDDEN_SINGLE
    const { steps } = solve(board(data))
    //console.log('steps', steps)
    expect(stepN(steps, [7, 1], 6)).toEqual(1)
    expect(stepN(steps, [4, 4], 5)).toEqual(1)
    expect(stepN(steps, [2, 1], 8)).toEqual(1)
  })
})
