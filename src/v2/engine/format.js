import { ROW, COL } from './board'

const toLetter = (i) => String.fromCharCode(0x41 + i)
const formatCoords = (coords) =>
  coords ? `${toLetter(coords[1])}${coords[0] + 1}` : ''

const formatItems = (items) => {
  return items
    .map((item) => {
      const { coords } = item
      return formatCoords(coords)
    })
    .join(' ')
}

const formatEliminations = (items) => {
  return items.length
    ? '\n  eliminates ' +
        items
          .map((item) => {
            const { coords, value } = item
            return `${value} at ${formatCoords(coords)}`
          })
          .join('; ')
    : ''
}

const formatStep = (step, detail) => {
  const { type, tuple, items, eliminations, groupType } = step
  return `${type} ${tuple} in ${
    groupType === ROW ? 'row' : groupType === COL ? 'col' : 'box'
  } ${formatItems(items)}${formatEliminations(eliminations)}${
    detail === true ? JSON.stringify(eliminations) : ''
  }`
}

const print = (steps) => {
  console.log(steps.map(formatStep).join('\n') + '\n')
}

export { print, formatStep }
