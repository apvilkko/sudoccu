import * as R from "ramda";
import { getIndexFromSize } from "../selectors";
import { uniq, isUnique, sample } from "../../engine/math";
import {
  isSolved as isCellSolved,
  newCell,
  clearCell,
  cellWithValue,
  getCandidates
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
  if (!board || !board.slice) {
    throw new Error("getRow null board: " + size + " " + JSON.stringify(board));
  }
  return board.slice(y * size, y * size + size);
};

const getRows = size => board => {
  console.log("getRows", size, board);
  return Array.from({ length: size }).map((_, i) => getRow(size)(board)(i));
};

const getCol = size => board => x => {
  const out = [];
  const get = atBoard(size);
  for (let y = 0; y < size; ++y) {
    out.push(get(board)(x, y));
  }
  return out;
};

const getBox = size => board => i => {
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
      // console.log("isValid col", x);
      return false;
    }
  }

  // Rows
  for (let y = 0; y < size; ++y) {
    if (!isUnique(values(getRow(size)(board)(y)))) {
      // console.log("isValid row", y);
      return false;
    }
  }

  // Blocks
  for (let i = 0; i < size; ++i) {
    if (!isUnique(values(getBox(size)(board)(i)))) {
      // console.log("isValid block", i);
      return false;
    }
  }

  return true;
};

const getBoxIndex = size => cell => {
  const dim = getDimFromSize(size);
  const get = atBoard(size);
  const boxRow = Math.floor(cell.y / dim);
  const boxCol = Math.floor(cell.x / dim);
  return boxRow * dim + boxCol;
};

/**
 * Gets cells that include any of the candidates but not match fully, and are not solved
 */
const getCellsWithCandidates = (candidates, block) => {
  const out = [];
  block.forEach(cell => {
    if (isCellSolved(cell)) {
      return;
    }
    if (!R.equals(sort(getCandidates(cell)), sort(candidates))) {
      candidates.forEach(candidate => {
        if (getCandidates(cell).includes(candidate)) {
          out.push(cell);
        }
      });
    }
  });
  return out;
};

const getAllCellsWithCandidate = (value, block, minAmount, maxCandidates) => {
  const out = [];
  block.forEach(cell => {
    if (isCellSolved(cell)) {
      return;
    }
    const cands = getCandidates(cell);
    const incl = cands.includes(value);
    const maxOk =
      typeof maxCandidates === "undefined" || cands.length <= maxCandidates;
    if (maxOk && incl) {
      out.push(cell);
    }
  });
  return out.length >= minAmount ? out : [];
};

const getCellsInBlockByCandidateValue = (
  value,
  amount,
  block,
  amountMax = 999
) => {
  const out = [];
  block.forEach(cell => {
    if (isCellSolved(cell)) {
      return;
    }
    const cands = getCandidates(cell);
    const incl = cands.includes(value);
    if (incl) {
      out.push(cell);
    }
  });
  return out.length >= amount && out.length <= amountMax ? out : [];
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

/**
 * Updates candidates so that solved cells are removed from applicable blocks
 */
const updateCandidates = size => board => solvedAlso => {
  const set = setCell(size);
  const get = atBoard(size);
  let newBoard = board;
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      const existing = getIntersectValuesAtBoard(size)(board)(x, y, true);
      const cell = get(newBoard)(x, y);
      // console.log("update", existing, cell);
      const newCell = {
        ...cell,
        candidates: cell.solvedValue
          ? []
          : R.without(existing)(getCandidates(cell))
      };
      if (solvedAlso) {
        newCell.solvedCandidates = [...newCell.candidates];
      }
      newBoard = set(newBoard)(newCell);
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

const initializeCandidates = size => board => {
  let newBoard = board;
  const candidateArray = Array.from({ length: size }).map((_, i) => i + 1);
  for (let i = 0; i < size * size; ++i) {
    const cell = board[i];
    newBoard = setCell(size)(newBoard)({
      ...cell,
      candidates: candidateArray,
      solvedCandidates: candidateArray
    });
  }
  return newBoard;
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
  return initializeCandidates(size)(board);
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

const setRandomCellSolved = size => board => {
  const available = board.filter(x => !isCellSolved(x));
  const item = sample(available);
  // console.log("cell", item, available);
  if (!item) {
    throw new Error("no item available!");
  }
  return setCell(size)(board)({ ...item, solvedValue: item.value });
};

// ============================================================
// utils
// ============================================================

const iterateBlocks = size => board => handler => {
  for (let i = 0; i < size; ++i) {
    handler(getRow(size)(board)(i), "row", i);
    handler(getCol(size)(board)(i), "col", i);
    handler(getBox(size)(board)(i), "box", i);
  }
};

export {
  updateCandidates,
  iterateBlocks,
  isSolved,
  getRow,
  getCol,
  getBox,
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
  getCellsWithCandidates,
  initializeCandidates,
  getCellsInBlockByCandidateValue,
  getAllCellsWithCandidate,
  setRandomCellSolved,
  getBoxIndex
};
