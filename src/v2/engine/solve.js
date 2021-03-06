import { ROW, COL, realIndexTo, toRealIndex, setValueToBoard } from './board'
import { isSolved } from './checks'
import { updateCandidates } from './candidates'
import nakedSingle from './strategies/nakedSingle'
import hiddenSingle from './strategies/hiddenSingle'
import nakedSet from './strategies/nakedSet'
import hiddenSet from './strategies/hiddenSet'
import { solvesSame, getEliminationFingerprint } from './steps'
import pointingSets from './strategies/pointingSets'
import boxLineReduction from './strategies/boxLineReduction'
import xWing from './strategies/xWing'

const ALL_STRATEGIES = [
  nakedSingle,
  hiddenSingle,
  nakedSet(2),
  hiddenSet(2),
  nakedSet(3),
  hiddenSet(3),
  nakedSet(4),
  hiddenSet(4),
  pointingSets,
  boxLineReduction,
  xWing,
]

const toCoords = (index) => {
  return [realIndexTo(COL, index), realIndexTo(ROW, index)]
}

const addItemCoords = (step) => (item) => {
  let realIndex = item.realIndex
  if (!realIndex && realIndex !== 0) {
    const { groupType, groupIndex } = step
    const { index } = item
    realIndex = toRealIndex(index, groupType, groupIndex)
  }
  const coords = toCoords(realIndex)
  return { ...item, realIndex, coords }
}

const addCoords = (step) => {
  const adder = addItemCoords(step)
  const items = (step.items || []).map(adder)
  const eliminations = (step.eliminations || []).map(adder)
  return { ...step, items, eliminations }
}

const removeCandidate = (board, i, value) => {
  if (board.candidates[i]) {
    board.candidates[i] = board.candidates[i].filter((x) => x !== value)
  }
}

const applyStep = (board, step) => {
  step.items.forEach((item) => {
    let realIndex = item.realIndex
    let withCoords = item
    if (!realIndex) {
      withCoords = addItemCoords(step)(item)
    }
    if (step.tuple.length === 1 && step.type.indexOf('ingle') > -1) {
      setValueToBoard(board, withCoords.realIndex, step.tuple[0])
    }
    if (step.eliminations) {
      step.eliminations.forEach((elimination) => {
        const item = addItemCoords(step)(elimination)
        removeCandidate(board, item.realIndex, item.value)
      })
    }
  })
}

const applySteps = (board, steps) => {
  for (let i = 0; i < steps.length; ++i) {
    applyStep(board, steps[i])
  }
}

const removeDuplicateSteps = (steps) => {
  const seen = {}
  const out = []
  for (let s = 0; s < steps.length; ++s) {
    const step = steps[s]
    const fingerprint = getEliminationFingerprint(steps[s])
    if (!seen[fingerprint]) {
      out.push(step)
    }
    seen[fingerprint] = true
  }
  return out
}

const MAX_ITERATIONS = 1000

const finalize = (status, steps) => {
  return {
    status,
    steps: removeDuplicateSteps(steps.map(addCoords)),
  }
}

const solve = (board, config) => {
  const usedStrategies = (config ? config.strategies : null) || ALL_STRATEGIES
  let steps = []
  let status = null
  if (isSolved(board)) {
    //status = 'Already solved!'
    //console.log(status)
    return finalize(status, steps)
  }

  let stratSteps
  let i = 0
  let iterations = 0

  updateCandidates(board, true)

  while (i < usedStrategies.length && iterations < MAX_ITERATIONS) {
    if (isSolved(board)) {
      //console.log('Solved!')
      return finalize(status, steps)
    }

    const strategy = usedStrategies[i]
    stratSteps = strategy(board)
    if (stratSteps.length) {
      //console.log(stratSteps)
      //console.log('before apply', board.data)
      applySteps(board, stratSteps)
      //console.log('after apply', board.data, board.candidates)
      updateCandidates(board)
      /*addStepsRemovingDuplicates(
        steps,
        removeDuplicateSteps(stratSteps.map(addCoords))
      )*/
      steps = steps.concat(stratSteps)
      if (i > 0) {
        i = 0
      }
    }
    ++i
    ++iterations
  }

  if (i === usedStrategies.length || iterations === MAX_ITERATIONS) {
    status = `Solver exhausted at iteration ${iterations}.`
    //console.log(status)
  }

  return finalize(status, steps)
}

export { solve as default, toRealIndex, ALL_STRATEGIES }
