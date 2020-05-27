import testcases from '../../testcases'
import solve from './solve'
import board, { ROW, COL, BOX, toRealIndex } from './board'
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

const typeIs = (type) => (x) => x.type === type

const convertToCoords = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  const parts = value.split('')
  return [Number(parts[1]) - 1, parts[0].charCodeAt() - 0x41]
}

const stepN = (steps, coords, value) =>
  steps.filter(cv(convertToCoords(coords), value)).length

const elimination = (matches, coordsOrCell, value) => {
  const coords = convertToCoords(coordsOrCell)
  const values = Array.isArray(value) ? value : [value]
  return values
    .map((val) => {
      return (
        matches.filter((x) =>
          (x.eliminations || []).some((e) => {
            return (
              e.coords[0] === coords[0] &&
              e.coords[1] === coords[1] &&
              e.value === val
            )
          })
        ).length > 0
      )
    })
    .every((x) => x === true)
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
    expect(stepN(steps, 'B8', 6)).toEqual(1)
    expect(stepN(steps, 'E5', 5)).toEqual(1)
    expect(stepN(steps, 'F3', 9)).toEqual(1)
    expect(stepN(steps, 'G4', 5)).toEqual(1)
    expect(stepN(steps, 'A5', 6)).toEqual(1)
    expect(stepN(steps, 'B3', 8)).toEqual(1)
    expect(stepN(steps, 'B4', 2)).toEqual(1)
    expect(stepN(steps, 'D6', 6)).toEqual(1)
    expect(stepN(steps, 'F6', 8)).toEqual(1)
  })

  it('solves naked pairs', () => {
    const data = testcases.TEST_NAKED_PAIRS
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('nakedPair'))
    expect(elimination(matches, [3, 0], 7)).toEqual(true)
    expect(elimination(matches, [3, 1], 7)).toEqual(true)
    expect(elimination(matches, [3, 2], 7)).toEqual(true)
    expect(elimination(matches, [5, 1], [1, 2])).toEqual(true)
    expect(elimination(matches, [2, 7], 7)).toEqual(true)
    expect(elimination(matches, [2, 8], 7)).toEqual(true)
    expect(elimination(matches, [4, 7], [3, 7])).toEqual(true)
  })

  it('solves hidden pairs', () => {
    const data = testcases.TEST_HIDDEN_PAIRS
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('hiddenPair'))
    expect(elimination(matches, 'D3', [5, 6])).toEqual(true)
    expect(elimination(matches, 'E3', [3, 6, 7])).toEqual(true)
    expect(elimination(matches, 'E2', 9)).toEqual(true)
    expect(elimination(matches, 'E7', [6, 9])).toEqual(true)
    expect(elimination(matches, 'F7', [1, 5, 9])).toEqual(true)
  })

  it('solves hidden triples', () => {
    const data = testcases.TEST_HIDDEN_TRIPLES
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('hiddenTriple'))
    expect(elimination(matches, 'A4', [4, 7, 8])).toEqual(true)
    expect(elimination(matches, 'A7', [4, 9])).toEqual(true)
    expect(elimination(matches, 'A9', [4, 7, 8, 9])).toEqual(true)
  })

  it('solves naked triples', () => {
    const data = testcases.TEST_NAKED_TRIPLES
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('nakedTriple'))

    expect(elimination(matches, 'E1', [5, 9])).toEqual(true)
    expect(elimination(matches, 'E3', [5, 9])).toEqual(true)
    expect(elimination(matches, 'E7', [5, 8, 9])).toEqual(true)
    expect(elimination(matches, 'E8', [5, 8, 9])).toEqual(true)
  })

  it('solves naked quads', () => {
    const data = testcases.TEST_NAKED_QUADS
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('nakedQuad'))

    expect(elimination(matches, 'A2', [1, 5])).toEqual(true)
    expect(elimination(matches, 'A3', 5)).toEqual(true)
    expect(elimination(matches, 'B3', [5, 6, 8])).toEqual(true)
    expect(elimination(matches, 'C3', 6)).toEqual(true)
  })

  it('solves pointing pairs', () => {
    const data = testcases.TEST_POINTING_PAIRS
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('pointingPair'))

    expect(elimination(matches, 'B7', [2, 6])).toEqual(true)
    expect(elimination(matches, 'B8', [2, 8])).toEqual(true)
    expect(elimination(matches, 'B9', [2])).toEqual(true)

    expect(elimination(matches, 'A8', [8])).toEqual(true)
    expect(elimination(matches, 'C8', [8])).toEqual(true)

    expect(elimination(matches, 'C2', [7])).toEqual(true)

    expect(elimination(matches, 'C7', [6])).toEqual(true)

    expect(elimination(matches, 'E1', [8])).toEqual(true)
    expect(elimination(matches, 'E3', [8])).toEqual(true)

    expect(elimination(matches, 'G2', [4])).toEqual(true)
    expect(elimination(matches, 'G3', [1, 4])).toEqual(true)
  })

  it('solves pointing triples', () => {
    const data = testcases.TEST_POINTING_TRIPLE
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('pointingTriple'))

    expect(elimination(matches, 'E6', 3)).toEqual(true)
  })

  it('solves box line reduction', () => {
    const data = testcases.TEST_BOX_LINE_REDUCTION
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('boxLineReduction'))

    expect(elimination(matches, 'B5', 2)).toEqual(true)
    expect(elimination(matches, 'C4', 2)).toEqual(true)
    expect(elimination(matches, 'C5', 2)).toEqual(true)

    expect(elimination(matches, 'B7', 4)).toEqual(true)
    expect(elimination(matches, 'B9', 4)).toEqual(true)
    expect(elimination(matches, 'C7', 4)).toEqual(true)
    expect(elimination(matches, 'C9', 4)).toEqual(true)
  })

  it('solves x-wing', () => {
    const data = testcases.TEST_X_WING
    const { steps } = solve(board(data))
    //print(steps)
    const matches = steps.filter(typeIs('xWing'))
    expect(elimination(matches, 'A4', 7)).toEqual(true)
    expect(elimination(matches, 'E4', 7)).toEqual(true)
    expect(elimination(matches, 'H4', 7)).toEqual(true)
    expect(elimination(matches, 'I4', 7)).toEqual(true)
    expect(elimination(matches, 'H8', 7)).toEqual(true)
    expect(elimination(matches, 'I8', 7)).toEqual(true)
  })
})

describe('getCandidatesAt', () => {
  fit('works', () => {
    expect(getCandidatesAt('1234567894', 10)).toEqual([5, 6, 7, 8, 9])
  })
})
