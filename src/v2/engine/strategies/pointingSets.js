import { SIZE, get, BOX, toRealIndex, realIndexTo } from '../board'
import { isInLine } from './boxLineReduction'

const pointingSets = (board) => {
  const steps = []
  for (let i = 0; i < SIZE; ++i) {
    const candidates = get[BOX](board, i, true)
    const seen = {}
    for (let c = 0; c < candidates.length; ++c) {
      const tuple = candidates[c]
      if (!tuple) {
        continue
      }
      for (let t = 0; t < tuple.length; ++t) {
        const key = tuple[t]
        if (!seen[key]) {
          seen[key] = {
            value: key,
            amount: 0,
            at: [],
          }
        }
        seen[key].amount++
        seen[key].at.push(c)
      }
    }
    const possibleEliminations = []
    Object.keys(seen).forEach((key) => {
      const item = seen[key]
      const { at, amount } = item
      if (amount === 2 || amount === 3) {
        const line = isInLine(at)
        if (line !== -1) {
          const realIndexes = at.map((x) => toRealIndex(x, BOX, i))
          const targetIndex = realIndexTo(line, realIndexes[0])
          possibleEliminations.push({
            groupType: line,
            index: targetIndex,
            realIndexes,
            ...item,
            degree: amount,
          })
        }
      }
    })
    possibleEliminations.forEach((possibleElimination) => {
      const {
        groupType,
        index,
        value,
        realIndexes,
        degree,
      } = possibleElimination
      const groupCandidates = get[groupType](board, index, true)
      const eliminations = []
      for (let c = 0; c < groupCandidates.length; ++c) {
        const cands = groupCandidates[c]
        if (!cands) {
          continue
        }
        const realIndex = toRealIndex(c, groupType, index)
        if (realIndexes.includes(realIndex)) {
          continue
        }
        if (cands.includes(value)) {
          eliminations.push(c)
        }
      }
      if (eliminations.length) {
        const step = {
          type: `pointing${degree === 2 ? 'Pair' : 'Triple'}`,
          tuple: [value],
          groupType,
          groupIndex: index,
          items: realIndexes.map((x) => ({ realIndex: x })),
          eliminations: eliminations.map((x) => ({ index: x, value })),
        }
        steps.push(step)
      }
    })
  }
  return steps
}

export default pointingSets
