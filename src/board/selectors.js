import { isUnique, uniq } from "../engine/math";

const getBoard = state => state.board;

const getSize = state => state.dim * state.dim;
const getDim = state => state.dim;

const getIndex = state => (x, y) => y * getSize(state) + x;

const at = state => (x, y) => getBoard(state)[getIndex(state)(x, y)];

const getRow = state => y => {
  const size = getSize(state);
  return getBoard(state).slice(y * size, y * size + size);
};

const getCol = state => x => {
  const out = [];
  for (let y = 0; y < getSize(state); ++y) {
    out.push(at(state)(x, y));
  }
  return out;
};

const getBlock = state => i => {
  const dim = getDim(state);
  const size = getSize(state);
  const startY = Math.floor(i / dim) * dim;
  const startX = (i * dim) % size;
  const out = [];
  for (let y = startY; y < startY + dim; ++y) {
    for (let x = startX; x < startX + dim; ++x) {
      out.push(at(state)(x, y));
    }
  }
  return out;
};

const getRows = state => () =>
  Array.from({ length: getSize(state) }).map((_, i) => getRow(state)(i));

const getIntersectValuesAt = state => (x, y, unsolved) => {
  const values = [];
  const dim = getDim(state);
  const size = getSize(state);
  const key = unsolved ? "solvedValue" : "value";
  for (let x1 = 0; x1 < size; ++x1) {
    if (x1 !== x && at(state)(x1, y)[key] !== null) {
      values.push(at(state)(x1, y)[key]);
    }
  }
  for (let y1 = 0; y1 < size; ++y1) {
    if (y1 !== y && at(state)(x, y1)[key] !== null) {
      values.push(at(state)(x, y1)[key]);
    }
  }
  const sx = Math.floor(x / dim) * dim;
  const sy = Math.floor(y / dim) * dim;
  for (let y2 = sy; y2 < sy + dim; ++y2) {
    for (let x2 = sx; x2 < sx + dim; ++x2) {
      if (y2 !== y && x2 !== x && at(state)(x2, y2)[key] !== null) {
        values.push(at(state)(x2, y2)[key]);
      }
    }
  }
  return uniq(values).filter(x => !!x);
};

const isValid = state => () => {
  const size = getSize(state);

  // Cols
  for (let x = 0; x < size; ++x) {
    if (!isUnique(values(getCol(state)(x)))) {
      return false;
    }
  }

  // Rows
  for (let y = 0; y < size; ++y) {
    if (!isUnique(values(getRow(state)(y)))) {
      return false;
    }
  }

  // Blocks
  for (let i = 0; i < size; ++i) {
    if (!isUnique(values(getBlock(state)(i)))) {
      return false;
    }
  }

  return true;
};

const isFilled = state => () =>
  getBoard(state).every(x => typeof x.value === "number");

const isCellSolved = cell =>
  cell.solvedValue && cell.value === cell.solvedValue;
const isSolved = state => () => getBoard(state).every(x => isCellSolved(x));

export {
  at,
  getBoard,
  getSize,
  getDim,
  getRow,
  getCol,
  getBlock,
  getRows,
  getIntersectValuesAt,
  isValid,
  isFilled,
  isSolved,
  isCellSolved,
  getIndex
};