import {
  equals,
  sortBy,
  identity,
  sortWith,
  pipe,
  prop,
  ascend,
  map,
  pick,
  isEmpty,
} from 'ramda'

const empty = (a) => !a || isEmpty(a)

const acc = (i) => pipe(prop('coords'), prop(i))
const sortByCoords = sortWith([ascend(acc(0)), ascend(acc(1))])
const sortValue = sortBy(identity)
const itemsEqual = pipe(
  map(pipe(prop('items'), map(pick(['coords'])), sortByCoords)),
  (x) => equals(x[0], x[1])
)
const eliminationsEqual = pipe(
  map(pipe(prop('eliminations'), map(pick(['coords', 'value'])), sortByCoords)),
  (x) => equals(x[0], x[1])
)

const getEliminationFingerprint = (step) => {
  const hasElims = step.eliminations && step.eliminations.length > 0
  if (step.tuple.length === 1 && step.items.length === 1 && !hasElims) {
    return `v${step.tuple[0]}:${step.items[0].realIndex}`
  }
  if (hasElims) {
    return JSON.stringify(
      map((x) => `v${x.value}:${x.realIndex}`)(step.eliminations)
    )
  }
  return JSON.stringify({ items: step.items, tuple: step.tuple })
}

const solvesSame = (a, b) => {
  if (
    a.tuple[0] === b.tuple[0] &&
    a.type.endsWith('Single') &&
    b.type.endsWith('Single') &&
    a.items[0].realIndex === b.items[0].realIndex
  ) {
    return true
  }

  const hasElims = [!empty(a.eliminations), !empty(b.eliminations)]
  if ((hasElims[0] && !hasElims[1]) || (hasElims[0] && !hasElims[1])) {
    return false
  }
  if (hasElims[0] && hasElims[1]) {
    return eliminationsEqual([a, b])
  }
  return equals(sortValue(a.tuple), sortValue(b.tuple)) && itemsEqual([a, b])
}

export { solvesSame, getEliminationFingerprint }
