import { getIndexFromSize } from "../selectors";
import { getListWithout, uniq, isUnique, sample } from "../../engine/math";
import {
  isSolved as isCellSolved,
  newCell,
  clearCell,
  cellWithValue
} from "./cell";
import { values, sort } from "../../engine/utils";

// ============================================================
// selectors
// ============================================================

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
const isFilled = board =>
  board ? board.every(x => typeof x.value === "number") : false;

const isValid = size => board => () => {
  // Cols
  for (let x = 0; x < size; ++x) {
    if (!isUnique(values(getCol(size)(board)(x)))) {
      //console.log("isValid col", x, values(getCol(size)(board)(x)));
      return false;
    }
  }

  // Rows
  for (let y = 0; y < size; ++y) {
    if (!isUnique(values(getRow(size)(board)(y)))) {
      console.log("isValid row", y, values(getRow(size)(board)(y)));
      return false;
    }
  }

  // Blocks
  for (let i = 0; i < size; ++i) {
    if (!isUnique(values(getBlock(size)(board)(i)))) {
      console.log("isValid block", i, values(getBlock(size)(board)(i)));
      return false;
    }
  }

  return true;
};

const equals = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Gets cells that include any of the candidates but not match fully
 * @param {} candidates
 * @param {*} block
 */
const getCellsWithCandidates = (candidates, block) => {
  const out = [];
  block.forEach(cell => {
    if (!equals(sort(cell.candidates), sort(candidates))) {
      candidates.forEach(candidate => {
        if (cell.candidates.includes(candidate)) {
          out.push(cell);
        }
      });
    }
  });
  return out;
};

// ============================================================
// actions
// ============================================================

const setCell = size => board => item => {
  if (typeof item.x === "undefined" || typeof item.y === "undefined") {
    throw new Error("setCell assert item " + JSON.stringify(item));
  }
  const index = getIndexFromSize(size)(item.x, item.y);
  const newBoard = [
    ...board.slice(0, index),
    { ...item },
    ...board.slice(index + 1)
  ];
  return newBoard;
};

const setRow = size => board => ({ y, row, setSolved }) => {
  const get = atBoard(size);
  return [
    ...board.slice(0, y * size),
    ...row.map((value, x) => cellWithValue(get(board)(x, y))(value, setSolved)),
    ...board.slice((y + 1) * size)
  ];
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

const clear = size => {
  const board = [];
  for (let i = 0; i < size * size; ++i) {
    const x = i % size;
    const y = Math.floor(i / size);
    board.push(newCell(x, y));
  }
  return board.map(item => clearCell(item));
};

const init = size => initState => {
  let board = clear(size);
  if (initState) {
    const rows = initState.split("\n");
    rows.forEach((element, i) => {
      board = setRow(size)(board)({
        y: i,
        row: element.split("").map(x => {
          const number = Number(x);
          return isNaN(number) ? undefined : number;
        }),
        setSolved: true
      });
    });
  }
  return board;
};

const setRandomCellUnsolved = size => board => {
  const available = board.filter(x => isCellSolved(x));
  const item = sample(available);
  // console.log("cell", item, available);
  if (!item) {
    throw new Error("no item available!");
  }
  return setCell(size)(board)({ ...item, solvedValue: null });
};

// ============================================================
// utils
// ============================================================

const iterateBlocks = size => board => handler => {
  for (let i = 0; i < size; ++i) {
    handler(getRow(size)(board)(i), "row");
    handler(getCol(size)(board)(i), "col");
    handler(getBlock(size)(board)(i), "block");
  }
};

export {
  updateCandidates,
  iterateBlocks,
  isSolved,
  getRow,
  getRows,
  setCell,
  atBoard,
  clear,
  getIntersectValuesAtBoard,
  setRow,
  isValid,
  isFilled,
  setRandomCellUnsolved,
  init,
  getCellsWithCandidates
};
