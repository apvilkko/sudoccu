import { isSolved, isValidAt } from './checks'
import board, { EMPTY, cleanData, replaceInData } from './board'
import { shuffle } from '../../engine/math'
import { getCandidatesAt } from './candidates'
import solve, { ALL_STRATEGIES } from './solve'

const bruteSolveStep = (data, stats) => {
  if (isSolved({ data })) {
    stats.time = new Date().getTime() - stats.startTime
    return { finished: true, data, stats }
  }

  const pos = data.indexOf(EMPTY)

  let choices = shuffle(getCandidatesAt(data, pos) || [])

  for (let i = 0; i < choices.length; ++i) {
    const val = choices[i]
    const newData = replaceInData(data, pos, val)
    const valid = isValidAt({ data: newData }, pos)
    if (!valid) {
      continue
    }
    const nextResult = bruteSolveStep(newData, stats)
    if (nextResult.finished) {
      return nextResult
    }
  }
  return { finished: false, data, stats }
}

const bruteSolve = (data) => {
  const stats = { startTime: new Date().getTime() }
  return bruteSolveStep(cleanData(data), stats)
}

const strategies = ALL_STRATEGIES.slice(0, 4)

const hasUniqueSolution = (data, amountOfChecks = 20) => {
  if (!data) return false
  let prev
  for (let i = 0; i < amountOfChecks; ++i) {
    let finished, resultData
    const b = board(data)
    //const { status } = solve(b, { strategies })
    //finished = !status
    resultData = b.data
    if (!finished) {
      // Normal solver could not solve, check with brute
      const result = bruteSolve(data)
      resultData = result.data
      finished = result.finished
    }
    if (!finished || (i > 0 && resultData !== prev)) {
      return false
    }
    prev = resultData
  }
  return true
}

export { bruteSolve as default, hasUniqueSolution }
