import { SIZE, DIM, ROW, COL, boxStartIndex, realIndexTo } from './board'
import { isSolved } from './checks'
import { updateCandidates } from './candidates'
import nakedSingle from './strategies/nakedSingle'
import hiddenSingle from './strategies/hiddenSingle'
import nakedSet from './strategies/nakedSet'
import { solvesSame } from './steps'

const ALL_STRATEGIES = [nakedSingle, hiddenSingle, nakedSet(2)]

const toRealIndex = (indexWithinGroup, groupType, groupIndex) => {
  if (groupType === ROW) {
    return groupIndex * SIZE + indexWithinGroup
  } else if (groupType === COL) {
    return indexWithinGroup * SIZE + groupIndex
  }
  const start = boxStartIndex(groupIndex)
  const addLines = Math.floor(indexWithinGroup / DIM)
  return start + addLines * SIZE + (indexWithinGroup % DIM)
}

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

const setValueToBoard = (board, realIndex, value) => {
  board.data =
    board.data.substring(0, realIndex) +
    value +
    board.data.substring(realIndex + 1)
}

const removeCandidate = (board, i, value) => {
  board.candidates[i] = board.candidates[i].filter((x) => x !== value)
}

const applyStep = (board, step) => {
  step.items.forEach((item) => {
    let realIndex = item.realIndex
    let withCoords = item
    if (!realIndex) {
      withCoords = addItemCoords(step)(item)
    }
    if (step.tuple.length === 1) {
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
  const toRemove = []
  const duplicates = {}
  for (let s = 0; s < steps.length; ++s) {
    const step = steps[s]
    for (let t = 0; t < steps.length; ++t) {
      const ref = steps[t]
      if (!duplicates[s] && s !== t && solvesSame(step, ref)) {
        toRemove.push(t)
        duplicates[s] = true
        duplicates[t] = true
      }
    }
  }
  const out = []
  for (let s = 0; s < steps.length; ++s) {
    if (!toRemove.includes(s)) {
      out.push(steps[s])
    }
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

const solve = (board) => {
  let steps = []
  let status = null
  if (isSolved(board)) {
    status = 'Already solved!'
    console.log(status)
    return finalize(status, steps)
  }

  let stratSteps
  let i = 0
  let iterations = 0

  updateCandidates(board, true)

  while (i < ALL_STRATEGIES.length && iterations < MAX_ITERATIONS) {
    if (isSolved(board)) {
      console.log('Solved!')
      return finalize(status, steps)
    }

    const strategy = ALL_STRATEGIES[i]
    stratSteps = strategy(board)
    if (stratSteps.length) {
      //console.log(stratSteps)
      //console.log('before apply', board.data)
      applySteps(board, stratSteps)
      //console.log('after apply', board.data)
      updateCandidates(board)
      steps = steps.concat(stratSteps)
      i = 0
    }
    ++i
    ++iterations
  }

  if (i === ALL_STRATEGIES.length || iterations === MAX_ITERATIONS) {
    status = `Solver exhausted at iteration ${iterations}.`
    console.log(status)
  }

  return finalize(status, steps)
}

export { solve as default, toRealIndex }
