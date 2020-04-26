import generate, { generatePuzzle } from './generate'
import { SIZE } from './board'
import { isValidAt, isValidNonet, isSolved } from './checks'

describe('generate', () => {
  it('generates valid board', () => {
    const NUM_BOARDS = 1000
    const boards = []
    for (let i = 0; i < NUM_BOARDS; ++i) {
      boards.push(generate())
    }
    const failed = boards.filter((x) => x.data === null)
    const succeeded = boards.filter((x) => x.data !== null)
    const times = succeeded.map((x) => x.stats.time)
    const average = times.reduce((a, b) => a + b, 0) / times.length
    console.log(
      `succeeded ${succeeded.length}/${NUM_BOARDS}, average ${average} ms`
    )
    expect(failed.length).toEqual(0)
    succeeded.forEach((x) => {
      expect(x.data.length).toEqual(SIZE * SIZE)
    })
  })
})

describe('isValidAt', () => {
  it('works', () => {
    expect(isValidAt({ data: '1234567891' }, 9)).toEqual(false)
    expect(isValidAt({ data: '1234567892' }, 9)).toEqual(false)
    expect(isValidAt({ data: '1234567894' }, 9)).toEqual(true)
  })
})

describe('isValidNonet', () => {
  it('works', () => {
    expect(isValidNonet('')).toEqual(true)
    expect(isValidNonet('123')).toEqual(true)
    expect(isValidNonet('923456789')).toEqual(false)
    expect(isValidNonet('123...789')).toEqual(true)
    expect(isValidNonet('123.7.789')).toEqual(false)
    expect(isValidNonet('12345678.')).toEqual(true)
    expect(isValidNonet('123456789')).toEqual(true)
    expect(isValidNonet('987123456')).toEqual(true)
  })
})

describe('generatePuzzle', () => {
  const puzzle = generatePuzzle(10)
  expect(isSolved(puzzle.board)).toEqual(true)
  expect(isSolved(puzzle.playerBoard)).toEqual(false)
  expect(puzzle.difficulty >= 10).toEqual(true)
})
