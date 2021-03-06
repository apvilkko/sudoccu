import { GROUPS, SIZE, get } from '../board'
import { getCombinations } from '../../../engine/math'
import { getUniqueCandidates } from '../candidates'

const nakedSet = (degree) => (board) => {
  const steps = []
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const candidates = get[GROUPS[g]](board, i, true)
      const seen = {}
      if (degree > 2) {
        const uniqueCandidates = getUniqueCandidates(candidates)
        const combinations = getCombinations(uniqueCandidates, degree)
        for (let o = 0; o < combinations.length; ++o) {
          const combination = combinations[o]
          const key = String(combination)
          for (let c = 0; c < candidates.length; ++c) {
            const tuple = candidates[c]
            if (!tuple) {
              continue
            }
            const isContained = tuple.every((x) => combination.includes(x))
            if (isContained) {
              if (!seen[key]) {
                seen[key] = {
                  tuple: combination,
                  amount: 0,
                  at: [],
                }
              }
              seen[key].amount++
              seen[key].at.push(c)
            }
          }
        }
      } else {
        for (let c = 0; c < candidates.length; ++c) {
          const tuple = candidates[c]
          if (!tuple) {
            continue
          }
          const key = String(tuple)
          if (!seen[key]) {
            seen[key] = {
              tuple,
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
        const { tuple, at } = item
        if (tuple.length === degree && item.amount === degree) {
          const eliminations = []
          for (let c = 0; c < candidates.length; ++c) {
            const cands = candidates[c]
            if (!cands || at.includes(c)) {
              continue
            }
            for (let t = 0; t < tuple.length; ++t) {
              const elimination = tuple[t]
              if (cands.includes(elimination)) {
                eliminations.push({ value: elimination, index: c })
              }
            }
          }

          if (eliminations.length) {
            const step = {
              type: `naked${
                degree === 2 ? 'Pair' : degree === 3 ? 'Triple' : 'Quad'
              }`,
              tuple,
              groupType: g,
              groupIndex: i,
              items: at.map((x) => ({ index: x })),
              eliminations,
            }
            //console.log(formatStep(step, true))
            steps.push(step)
          }
        }
      })
    }
  }
  return steps
}

export default nakedSet
