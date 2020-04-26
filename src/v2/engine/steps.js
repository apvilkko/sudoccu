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

const solvesSame = (a, b) => {
  const hasElims = [!empty(a.eliminations), !empty(b.eliminations)]
  if ((hasElims[0] && !hasElims[1]) || (hasElims[0] && !hasElims[1])) {
    return false
  }
  if (hasElims[0] && hasElims[1]) {
    return eliminationsEqual([a, b])
  }
  return equals(sortValue(a.tuple), sortValue(b.tuple)) && itemsEqual([a, b])
}

export { solvesSame }
