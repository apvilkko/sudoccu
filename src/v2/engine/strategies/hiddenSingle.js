import { GROUPS, SIZE, get } from '../board'

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
          const step = {
            type: 'hiddenSingle',
            tuple: [value],
            groupIndex: i,
            groupType: g,
            items: [{ index: indexes[0] }],
          }
          if (value === 1) {
            //console.log('hidden single found', step, candidates)
          }

          steps.push(step)
        }
      })
    }
  }
  return steps
}

export default hiddenSingle
