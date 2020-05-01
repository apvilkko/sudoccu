import { SIZE, get, BOX, ROW, COL, toRealIndex, realIndexTo } from '../board'

const isInLine = (i, group) => {
  const inRow =
    i.every((x) => [0, 1, 2].includes(x)) ||
    i.every((x) => [3, 4, 5].includes(x)) ||
    i.every((x) => [6, 7, 8].includes(x))
  const inCol =
    i.every((x) => [0, 3, 6].includes(x)) ||
    i.every((x) => [1, 4, 7].includes(x)) ||
    i.every((x) => [2, 5, 8].includes(x))
  if (typeof group !== 'undefined') {
    if (inRow && group === ROW) {
      return ROW
    } else if (inCol && group === COL) {
      return COL
    }
    return -1
  }
  return inRow ? ROW : inCol ? COL : -1
}

const groups = [ROW, COL]

const boxLineReduction = (board) => {
  const steps = []
  for (let g = 0; g < groups.length; ++g) {
    const group = groups[g]
    for (let i = 0; i < SIZE; ++i) {
      const candidates = get[group](board, i, true)
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

      Object.keys(seen).forEach((key) => {
        const item = seen[key]
        const { value, at, amount } = item
        if (amount === 2 || amount === 3) {
          const line = isInLine(at, ROW)
          if (line !== -1) {
            const possibleEliminations = []
            const realIndexes = at.map((x) => toRealIndex(x, group, i))
            const boxIndex = realIndexTo(BOX, realIndexes[0])
            const boxCands = get[BOX](board, boxIndex, true)
            for (let c = 0; c < boxCands.length; ++c) {
              const boxCandTuple = boxCands[c]
              if (!boxCandTuple) {
                continue
              }
              const candRealIndex = toRealIndex(c, BOX, boxIndex)
              if (realIndexes.includes(candRealIndex)) {
                continue
              }
              if (boxCandTuple.includes(value)) {
                possibleEliminations.push(c)
              }
            }
            if (possibleEliminations.length) {
              steps.push({
                type: 'boxLineReduction',
                tuple: [value],
                groupType: BOX,
                groupIndex: boxIndex,
                items: realIndexes.map((x) => ({ realIndex: x })),
                eliminations: possibleEliminations.map((x) => ({
                  index: x,
                  value,
                })),
              })
            }
          }
        }
      })
    }
  }
  return steps
}

export { boxLineReduction as default, isInLine }
