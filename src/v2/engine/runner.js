import testcases from '../../testcases'
import solve from './solve'
import board from './board'
import { generatePuzzle } from './generate'
import { isSolved } from './checks'

//const data = testcases.TEST_NAKED_PAIRS
//const { steps } = solve(board(data))

function median(values) {
  values.sort((a, b) => a - b)

  var half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]
  else return (values[half - 1] + values[half]) / 2.0
}

const ITERATIONS = 20
const times = []
const difficulty = 75

const start = new Date().getTime()

for (let i = 0; i < ITERATIONS; ++i) {
  const startTime = new Date().getTime()
  const puzzle = generatePuzzle(difficulty)
  const checks = [
    isSolved(puzzle.board) === true,
    isSolved(puzzle.playerBoard) === false,
    puzzle.difficulty >= difficulty,
  ]
  const delta = new Date().getTime() - startTime
  if (!checks.every((x) => !!x)) {
    console.log(i, checks)
    break
  }
  times.push(delta)
}

const average = times.reduce((acc, curr) => acc + curr, 0) / times.length
const med = median([...times])
console.log(
  `${ITERATIONS} runs took ${average} on average, ${med} median, difficulty ${difficulty}`
)
console.log(times)
console.log(new Date().getTime() - start, 'ms')
