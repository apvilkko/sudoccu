import { isSolved, isValidAt } from './checks'
import { EMPTY, cleanData, replaceInData } from './board'
import { shuffle } from '../../engine/math'
import { getCandidatesAt } from './candidates'

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

const hasUniqueSolution = (data, amountOfChecks = 20) => {
  if (!data) return false
  let prev
  for (let i = 0; i < amountOfChecks; ++i) {
    const result = bruteSolve(data)
    if (!result.finished || (i > 0 && result.data !== prev)) {
      return false
    }
    prev = result.data
  }
  return true
}

export { bruteSolve as default, hasUniqueSolution }
