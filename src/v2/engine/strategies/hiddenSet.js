import { GROUPS, SIZE, get } from '../board'
import { getUniqueCandidates } from '../candidates'
import { getCombinations } from '../../../engine/math'

const hiddenSet = (degree) => (board) => {
  const steps = []
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const candidates = get[GROUPS[g]](board, i, true)
      const uniqueCandidates = getUniqueCandidates(candidates)
      const combinations = getCombinations(uniqueCandidates, degree)
      const seen = {}

      for (let o = 0; o < combinations.length; ++o) {
        const combination = combinations[o]
        const key = String(combination)
        for (let c = 0; c < candidates.length; ++c) {
          const tuple = candidates[c]
          if (!tuple) {
            continue
          }
          const isContained = combination.some((x) => tuple.includes(x))
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

      Object.keys(seen).forEach((key) => {
        const item = seen[key]
        const { tuple, at } = item
        if (item.amount === degree) {
          const eliminations = []

          for (let a = 0; a < at.length; ++a) {
            const index = at[a]
            const cands = candidates[index]
            for (let c = 0; c < cands.length; ++c) {
              const cand = cands[c]
              if (!tuple.includes(cand)) {
                eliminations.push({ value: cand, index })
              }
            }
          }

          if (eliminations.length) {
            const step = {
              type: `hidden${
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

export default hiddenSet
