import * as R from 'ramda'
import { SIZE, ROW, COL, get, toRealIndex } from '../board'
import { getNumberOfOccurrences } from '../candidates'

const groups = [ROW, COL]

const xWing = (board) => {
  const steps = []
  for (let g = 0; g < groups.length; ++g) {
    const group = groups[g]
    const seen = { groupType: g }
    for (let i = 0; i < SIZE; ++i) {
      const candidates = get[group](board, i, true)
      const occurrences = getNumberOfOccurrences(candidates)
      const pairs = Object.values(occurrences).filter((x) => x.at.length === 2)
      pairs.forEach((pair) => {
        if (!seen[pair.value]) {
          seen[pair.value] = { value: pair.value, at: [] }
        }
        seen[pair.value].at.push({
          groupIndex: i,
          at: pair.at,
        })
      })
    }
    //console.log(JSON.stringify(seen, null, 2))
    Object.values(seen).forEach((candidatePair) => {
      if (candidatePair.at && candidatePair.at.length === 2) {
        const flattened = R.map(R.prop('at'), candidatePair.at)
        if (R.equals(flattened[0], flattened[1])) {
          const candidateDirection = seen.groupType === ROW ? COL : ROW
          const groupIndexes = R.map(R.prop('groupIndex'), candidatePair.at)
          const eliminations = []
          flattened[0].forEach((candidateGroupIndex) => {
            const groupCandidates = get[candidateDirection](
              board,
              candidateGroupIndex,
              true
            )
            groupCandidates.forEach((groupCandidateArr, i) => {
              if (
                groupCandidateArr &&
                !groupIndexes.includes(i) &&
                groupCandidateArr.includes(candidatePair.value)
              ) {
                const realIndex = toRealIndex(
                  i,
                  candidateDirection,
                  candidateGroupIndex
                )
                eliminations.push({
                  realIndex,
                  value: candidatePair.value,
                })
              }
            })
          })
          if (eliminations.length) {
            const step = {
              type: 'xWing',
              tuple: [candidatePair.value],
              items: R.flatten(
                groupIndexes.map((gi, i) =>
                  flattened[i].map((x) => ({
                    realIndex: toRealIndex(x, g, gi),
                  }))
                )
              ),
              groupType: g,
              eliminations,
            }
            steps.push(step)
          }
        }
      }
    })
  }
  return steps
}

export default xWing
