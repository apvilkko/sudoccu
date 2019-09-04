import { getIndexFromSize } from "../selectors";
import { getListWithout, uniq } from "../../engine/math";
import { isSolved as isCellSolved } from "./cell";

// selectors

const atBoard = size => board => (x, y) => {
  const index = getIndexFromSize(size)(x, y);
  return board[index];
};

const getDimFromSize = size => Math.round(Math.sqrt(size));

const getRow = size => board => y => {
  return board.slice(y * size, y * size + size);
};

const getRows = size => board =>
  Array.from({ length: size }).map((_, i) => getRow(size)(board)(i));

const getCol = size => board => x => {
  const out = [];
  const get = atBoard(size);
  for (let y = 0; y < size; ++y) {
    out.push(get(board)(x, y));
  }
  return out;
};

const getBlock = size => board => i => {
  const dim = getDimFromSize(size);
  const get = atBoard(size);
  const startY = Math.floor(i / dim) * dim;
  const startX = (i * dim) % size;
  const out = [];
  for (let y = startY; y < startY + dim; ++y) {
    for (let x = startX; x < startX + dim; ++x) {
      out.push(get(board)(x, y));
    }
  }
  return out;
};

const getIntersectValuesAtBoard = size => board => (x, y, unsolved) => {
  const vals = [];
  const dim = getDimFromSize(size);
  const at = atBoard(size);
  const key = unsolved ? "solvedValue" : "value";
  for (let x1 = 0; x1 < size; ++x1) {
    if (x1 !== x && at(board)(x1, y)[key] !== null) {
      vals.push(at(board)(x1, y)[key]);
    }
  }
  for (let y1 = 0; y1 < size; ++y1) {
    if (y1 !== y && at(board)(x, y1)[key] !== null) {
      vals.push(at(board)(x, y1)[key]);
    }
  }
  const sx = Math.floor(x / dim) * dim;
  const sy = Math.floor(y / dim) * dim;
  for (let y2 = sy; y2 < sy + dim; ++y2) {
    for (let x2 = sx; x2 < sx + dim; ++x2) {
      if (y2 !== y && x2 !== x && at(board)(x2, y2)[key] !== null) {
        vals.push(at(board)(x2, y2)[key]);
      }
    }
  }
  return uniq(vals).filter(x => !!x);
};

const isSolved = board => board.every(x => isCellSolved(x));

// actions

const setCell = size => board => item => {
  const index = getIndexFromSize(size)(item.x, item.y);
  return [...board.slice(0, index), { ...item }, ...board.slice(index + 1)];
};

const updateCandidates = size => board => () => {
  const set = setCell(size);
  const get = atBoard(size);
  let newBoard = board;
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      const existing = getIntersectValuesAtBoard(size)(board)(x, y, true);
      newBoard = set(newBoard)({
        ...get(newBoard)(x, y),
        candidates: getListWithout(size)(existing)
      });
    }
  }
  return newBoard;
};

const iterateBlocks = size => board => handler => {
  for (let i = 0; i < size; ++i) {
    handler(getRow(size)(board)(i));
    handler(getCol(size)(board)(i));
    handler(getBlock(size)(board)(i));
  }
};

export { updateCandidates, iterateBlocks, isSolved, getRows };
