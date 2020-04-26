import { CHOICES, SIZE, EMPTY, replaceInData } from './board'
import { shuffle, sample } from '../../engine/math'
import { getCandidatesAt } from './candidates'
import { isValidAt } from './checks'
import { hasUniqueSolution } from './bruteSolve'
import board from './board'

const randomRow = () => shuffle(CHOICES).join('')

const fill = (data, stats) => {
  if (data.length === SIZE * SIZE) {
    stats.time = new Date().getTime() - stats.startTime
    return {
      finished: true,
      data,
      stats,
    }
  }

  let pos = data.length
  let choices = shuffle(getCandidatesAt(data, pos) || [])

  for (let i = 0; i < choices.length; ++i) {
    const val = choices[i]
    const newData = data + val
    const valid = isValidAt({ data: newData }, pos)
    if (!valid) {
      continue
    }
    const nextResult = fill(newData, stats)
    if (nextResult.finished) {
      return nextResult
    }
  }
  return { finished: false, data, stats }
}

const generate = () => {
  const stats = {
    startTime: new Date().getTime(),
  }
  return fill(randomRow(), stats)
}

const generateUniqueBoard = () => {
  let data = ''
  while (!hasUniqueSolution(data)) {
    const result = generate()
    data = result.data
  }
  return data
}

const emptyRegex = /\./g
const calculateDifficulty = (data) => {
  return (data.match(emptyRegex) || []).length
}

const getRemovalCandidates = (data) => {
  return data
    .split('')
    .map((x, i) => [i, x])
    .filter((x) => x[1] !== EMPTY)
}

const createSolvable = (data, desiredDifficulty) => {
  const difficulty = calculateDifficulty(data)
  if (difficulty >= desiredDifficulty) {
    return { finished: true, data, difficulty }
  }

  const candidates = shuffle(getRemovalCandidates(data))

  for (let c = 0; c < candidates.length; ++c) {
    const [i, _] = candidates[c]
    const newData = replaceInData(data, i, EMPTY)
    if (hasUniqueSolution(newData, 10)) {
      const nextResult = createSolvable(newData, desiredDifficulty)
      if (nextResult.finished) {
        return nextResult
      }
    }
  }
  return { data: null, difficulty: 0 }
}

const generatePuzzle = (desiredDifficulty = 20) => {
  const data = generateUniqueBoard()
  const b = board(data)
  const puzzle = createSolvable(data, desiredDifficulty)
  return {
    board: b,
    playerBoard: board(puzzle.data),
    difficulty: puzzle.difficulty,
  }
}

export { generate as default, generatePuzzle }
