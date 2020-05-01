//import MersenneTwister from "mersenne-twister";
//const generator = new MersenneTwister();

const random = () => Math.random()

function shuffle(a) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

const rand = (min, max) => min + Math.floor(random() * (max - min + 1))
const sample = (arr) =>
  arr.length > 0 ? arr[rand(0, arr.length - 1)] : undefined

const randomBlock = (size) => {
  const line = Array.from({ length: size }).map((_, i) => i + 1)
  shuffle(line)
  return line
}

const getListWithout = (size) => (omit, shouldShuffle) => {
  const choices = []
  for (let i = 1; i < size + 1; ++i) {
    if (!omit.includes(i)) {
      choices.push(i)
    }
  }
  if (shouldShuffle) {
    shuffle(choices)
  }
  return choices
}

const getRandomWithout = (size) => (omit) => getListWithout(size)(omit, true)[0]

const getCombinations = (arr, degree) => {
  const out = []

  if (degree === 1 && arr.length === 1) {
    return [[arr[0]]]
  }

  const iterate = (start, depth, tuple) => {
    for (let i = start; i < arr.length; ++i) {
      const next = [...tuple, arr[i]]
      if (depth > 0) {
        iterate(i + 1, depth - 1, next)
      } else {
        if (next.length === degree) {
          out.push(next)
        }
      }
    }
  }

  for (let d = 0; d < degree; ++d) {
    iterate(0, d, [])
  }

  return out
}

const uniq = (arr) => {
  const values = {}
  for (let i = 0; i < arr.length; ++i) {
    values[arr[i]] = true
  }
  return Object.keys(values).map(Number)
}

const isUnique = (arr) => uniq(arr).length === arr.length

export {
  shuffle,
  getRandomWithout,
  randomBlock,
  isUnique,
  uniq,
  getListWithout,
  sample,
  getCombinations,
}
