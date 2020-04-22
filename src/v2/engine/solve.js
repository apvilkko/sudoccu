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
      const cands = CHOICES.filter((x) => combo.indexOf(x) === -1)
      console.log(cands)
      // TODO set cands to model
    }
  }
}

const toCoords = (index) => {
  return [index % SIZE, Math.floor(index / SIZE)]
}

const nakedSingle = (board) => {
  const steps = []
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const group = get[GROUPS[g]](board, i)
      const candidates = getCandidates(group)
      if (candidates.length === 1) {
        steps.push({
          type: 'nakedSingle',
          value: candidates[0].candidates[0],
          index: candidates[0].index,
          groupType: GROUPS[g],
          groupIndex: i,
        })
      }
    }
  }
  return steps
}

const hiddenSingle = (board) => {
  const steps = []
  return steps
}

const addCoords = (step) => {
  const { index, groupType, groupIndex } = step
  const realIndex = toRealIndex(index, groupType, groupIndex)
  step.realIndex = realIndex
  step.coords = toCoords(realIndex)
  return step
}

const ALL_STRATEGIES = [nakedSingle, hiddenSingle]

const applySteps = (board, steps) => {
  return board
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

const solve = (board) => {
  let steps = []
  if (isSolved(board)) {
    console.log('Already solved')
    return steps
  }

  let stratSteps
  let i = 0
  let iterations = 0
  while (i < ALL_STRATEGIES.length && iterations < MAX_ITERATIONS) {
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
    console.log('Solver exhausted', i, iterations)
  }

  steps = removeDuplicateSteps(steps.map(addCoords))

  return steps
}

export { solve as default, toRealIndex }
