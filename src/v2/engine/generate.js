import { CHOICES, GROUPS, SIZE, get, EMPTY, realIndexTo, DIM } from './board'
import { shuffle } from '../../engine/math'
import { getCandidatesAt } from './solve'

const isValidNonet = (nonet) => {
  const acc = {}
  for (let i = 0; i < nonet.length; ++i) {
    if (nonet[i] !== EMPTY) {
      if (!acc[nonet[i]]) {
        acc[nonet[i]] = 0
      }
      if (++acc[nonet[i]] > 1) {
        return false
      }
    }
  }
  return true
}

const isValidBoard = (board) => {
  for (let g = 0; g < GROUPS.length; ++g) {
    for (let i = 0; i < SIZE; ++i) {
      const group = get[GROUPS[g]](board, i)
      if (!isValidNonet(group)) {
        return false
      }
    }
  }
  return true
}

const isValidAt = (board, realIndex) => {
  for (let g = 0; g < GROUPS.length; ++g) {
    const i = realIndexTo(g, realIndex)
    const group = get[GROUPS[g]](board, i)
    if (!isValidNonet(group)) {
      return false
    }
  }
  return true
}

const randomRow = () => shuffle(CHOICES).join('')

const fill = (data, stats) => {
  if (data.length === SIZE * SIZE) {
    stats.time = new Date().getTime() - stats.startTime
    return {
      result: true,
      data,
      stats,
    }
  }

  let pos = data.length
  let choices = shuffle(getCandidatesAt(data, pos) || [])

  for (let i = 0; i < choices.length; ++i) {
    const val = choices[i]
    const newData = data + val
    const valid = isValidAt({ data: newData }, pos)
    if (!valid) {
      continue
    }
    const nextResult = fill(newData, stats)
    if (nextResult.result) {
      return nextResult
    }
  }
  return { result: false, data, stats }
}

const generate = () => {
  const startTime = new Date().getTime()
  let startingRow = randomRow()
  let data = startingRow
  const stats = {
    startTime,
  }
  return fill(data, stats)
}

export { generate as default, isValidNonet, isValidAt }
