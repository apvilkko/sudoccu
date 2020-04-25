import {
  GROUPS,
  SIZE,
  DIM,
  ROW,
  COL,
  BOX,
  get,
  boxStartIndex,
  EMPTY,
  CHOICES,
} from './board'

const isSolved = (board) => board.data.indexOf('.') === -1

const getCandidates = (group) => {
  const present = {}
  const empties = []
  for (let i = 0; i < SIZE; ++i) {
    if (group[i] !== EMPTY) {
      present[group[i]] = true
    } else {
      empties.push(i)
    }
  }
  const candidates = []
  for (let e = 0; e < empties.length; ++e) {
    const cands = []
    for (let n = 1; n < SIZE + 1; ++n) {
      if (!present[n]) {
        cands.push(n)
      }
    }
    if (cands.length) {
      candidates.push({ index: empties[e], candidates: cands })
    }
  }
  return candidates
}

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

const updateCandidates = (board) => {
  for (let i = 0; i < board.data.length; ++i) {
    const value = board.data[i]
    let candidates = null
    if (value === EMPTY) {
      const rowIndex = Math.floor(i / SIZE)
      const colIndex = i % SIZE
      const row = get[ROW](board, rowIndex)
      const col = get[COL](board, colIndex)
      const box = get[BOX](
        board,
        Math.floor(rowIndex / DIM) * DIM + Math.floor(colIndex / DIM)
      )
      const combo = row + col + box
      candidates = CHOICES.filter((x) => combo.indexOf(x) === -1).map((x) =>
        parseInt(x)
      )
    }
    board.candidates[i] = candidates
  }
}

const toCoords = (index) => {
  return [index % SIZE, Math.floor(index / SIZE)]
}

const nakedSingle = (board) => {
  const steps = []
  for (let i = 0; i < board.candidates.length; ++i) {
    if (board.candidates[i] && board.candidates[i].length === 1) {
      steps.push({
        type: 'nakedSingle',
        value: board.candidates[i][0],
        realIndex: i,
      })
    }
  }
  return steps
}

const getAmounts = (candidates) => {
  const ret = {}
  for (let i = 0; i < candidates.length; ++i) {
    if (candidates[i]) {
      for (let j = 0; j < candidates[i].length; ++j) {
        const val = candidates[i][j]
        if (!ret[val]) {
          ret[val] = []
        }
        ret[val].push(i)
      }
    }
  }
  return ret
}

const hiddenSingle = (board) => {
  const steps = []
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const candidates = get[GROUPS[g]](board, i, true)
      const amounts = getAmounts(candidates)
      Object.keys(amounts).forEach((key) => {
        const indexes = amounts[key]
        if (indexes.length === 1) {
          const value = parseInt(key)
          steps.push({
            type: 'hiddenSingle',
            value,
            groupIndex: i,
            groupType: g,
            index: indexes[0],
          })
        }
      })
    }
  }
  return steps
}

const addCoords = (step) => {
  let realIndex = step.realIndex
  if (!realIndex && realIndex !== 0) {
    const { index, groupType, groupIndex } = step
    realIndex = toRealIndex(index, groupType, groupIndex)
  }
  const coords = toCoords(realIndex)
  //console.log('addCoords', step, coords, realIndex)
  return { ...step, coords, realIndex }
}

const ALL_STRATEGIES = [nakedSingle, hiddenSingle]

const setValueToBoard = (board, realIndex, value) => {
  board.data =
    board.data.substring(0, realIndex) +
    value +
    board.data.substring(realIndex + 1)
}

const applyStep = (board, step) => {
  if (step.type === 'hiddenSingle' || step.type === 'nakedSingle') {
    let realIndex = step.realIndex
    if (!realIndex) {
      const withCoords = addCoords(step)
      setValueToBoard(board, withCoords.realIndex, step.value)
    }
  }
}

const applySteps = (board, steps) => {
  for (let i = 0; i < steps.length; ++i) {
    applyStep(board, steps[i])
  }
}

const solvesSame = (a, b) => {
  return (
    a.coords[0] === b.coords[0] &&
    a.coords[1] === b.coords[1] &&
    a.value === b.value
  )
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
  while (i < ALL_STRATEGIES.length && iterations < MAX_ITERATIONS) {
    if (isSolved(board)) {
      console.log('Solved!')
      return finalize(status, steps)
    }

    const strategy = ALL_STRATEGIES[i]
    updateCandidates(board)
    stratSteps = strategy(board)
    if (stratSteps.length) {
      //console.log(stratSteps)
      applySteps(board, stratSteps)
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
