import testcases from '../../testcases'
import solve, { toRealIndex } from './solve'
import board, { ROW, COL, BOX } from './board'
import { getCandidatesAt } from './candidates'
import { isSolved } from './checks'
import bruteSolve, { hasUniqueSolution } from './bruteSolve'
import { print as formatPrint } from './format'

const DEBUG = true
const print = (x) => DEBUG && formatPrint(x)

const cv = (coords, value) => (x) =>
  x.items[0].coords[0] === coords[0] &&
  x.items[0].coords[1] == coords[1] &&
  x.tuple[0] === value

const stepN = (steps, coords, value) => steps.filter(cv(coords, value)).length

const typeIs = (type) => (x) => x.type === type

const elimination = (matches, coords, value) => {
  return (
    matches.filter((x) =>
      (x.eliminations || []).some((e) => {
        return (
          e.coords[0] === coords[0] &&
          e.coords[1] === coords[1] &&
          e.value === value
        )
      })
    ).length > 0
  )
}

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

describe('bruteSolve', () => {
  it('solves valid puzzle', () => {
    const data = testcases.TEST_HIDDEN_TRIPLES
    const result = bruteSolve(data)
    expect(isSolved({ data: result.data })).toEqual(true)
  })
})

describe('hasUniqueSolution', () => {
  it('works, positive', () => {
    const data = testcases.TEST_POINTING_PAIRS
    expect(hasUniqueSolution(data)).toEqual(true)
  })
  it('works, negative', () => {
    const data = testcases.TEST_MULTIPLE_SOLUTIONS
    expect(hasUniqueSolution(data)).toEqual(false)
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
    //console.log('steps', JSON.stringify(steps, null, 2))
    expect(steps.length).toEqual(3)
    expect(stepN(steps, [2, 0], 9)).toEqual(1)
    expect(stepN(steps, [7, 3], 3)).toEqual(1)
    expect(stepN(steps, [6, 6], 3)).toEqual(1)
  })

  it('solves hidden singles', () => {
    const data = testcases.TEST_HIDDEN_SINGLE
    const { steps } = solve(board(data))
    //print(steps)
    expect(stepN(steps, [7, 1], 6)).toEqual(1)
    expect(stepN(steps, [4, 4], 5)).toEqual(1)
    expect(stepN(steps, [2, 1], 8)).toEqual(1)
  })

  it('solves naked pairs', () => {
    const data = testcases.TEST_NAKED_PAIRS
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('nakedPair'))
    expect(elimination(matches, [3, 0], 7)).toEqual(true)
    expect(elimination(matches, [3, 1], 7)).toEqual(true)
    expect(elimination(matches, [3, 2], 7)).toEqual(true)

    expect(elimination(matches, [5, 1], 1)).toEqual(true)
    expect(elimination(matches, [5, 1], 2)).toEqual(true)

    expect(elimination(matches, [2, 7], 7)).toEqual(true)
    expect(elimination(matches, [2, 8], 7)).toEqual(true)

    expect(elimination(matches, [4, 7], 3)).toEqual(true)
    expect(elimination(matches, [4, 7], 7)).toEqual(true)
  })
})

describe('getCandidatesAt', () => {
  it('works', () => {
    expect(getCandidatesAt('1234567894', 10)).toEqual([5, 6, 7, 8, 9])
  })
})
