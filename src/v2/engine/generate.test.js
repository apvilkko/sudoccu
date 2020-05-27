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
  it('works, first box', () => {
    expect(isValidAt({ data: '1234567891' }, 9)).toEqual(false)
    expect(isValidAt({ data: '1234567892' }, 9)).toEqual(false)
    expect(isValidAt({ data: '1234567894' }, 9)).toEqual(true)
  })

  it('works, 4th box', () => {
    expect(isValidAt({ data: '4352697816825714931978345628' }, 27)).toEqual(
      true
    )
    expect(
      isValidAt({ data: '4352697816825714931978345628261953472' }, 36)
    ).toEqual(false)
    expect(
      isValidAt({ data: '4352697816825714931978345628261953473' }, 36)
    ).toEqual(true)
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
  it('works, easy', () => {
    const puzzle = generatePuzzle(10)
    expect(isSolved(puzzle.board)).toEqual(true)
    expect(isSolved(puzzle.playerBoard)).toEqual(false)
    expect(puzzle.difficulty >= 10).toEqual(true)
  })

  it('works, medium', () => {
    const puzzle = generatePuzzle(50)
    expect(isSolved(puzzle.board)).toEqual(true)
    expect(isSolved(puzzle.playerBoard)).toEqual(false)
    expect(puzzle.difficulty >= 50).toEqual(true)
  })

  it('works, hard', () => {
    const startTime = new Date().getTime()
    const puzzle = generatePuzzle(95)
    expect(isSolved(puzzle.board)).toEqual(true)
    expect(isSolved(puzzle.playerBoard)).toEqual(false)
    expect(puzzle.difficulty >= 95).toEqual(true)
    console.log('generatePuzzle took ', new Date().getTime() - startTime, 'ms')
  })
})
