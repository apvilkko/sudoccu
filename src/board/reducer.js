import {
  INIT,
  CLEAR,
  SET_ROW,
  SET_RANDOM_UNSOLVED,
  UPDATE_CANDIDATES
} from "./actions";
import {
  getSize,
  getBoard,
  at,
  isCellSolved,
  getIndex,
  getIntersectValuesAt
} from "./selectors";
import { sample, getListWithout } from "../engine/math";

const cell = (x, y) => {
  return { x, y };
};

const cellWithValue = oldCell => (value, setSolved) => {
  if (!oldCell) {
    throw new Error("oldCell can not be empty: " + value);
  }
  const newCell = cell(oldCell.x, oldCell.y);
  newCell.value = value;
  if (setSolved) {
    newCell.solvedValue = value;
  }
  return newCell;
};

const clearCell = item => ({
  ...item,
  value: null,
  candidates: [],
  solvedValue: null
});

const setBoard = state => board => ({
  ...state,
  board
});

const setCell = state => item => {
  const board = getBoard(state);
  const index = getIndex(state)(item.x, item.y);
  return setBoard(state)([
    ...board.slice(0, index),
    { ...item },
    ...board.slice(index + 1)
  ]);
};

const setRow = state => ({ y, row, setSolved }) => {
  const board = getBoard(state);
  const size = getSize(state);
  const newBoard = [
    ...board.slice(0, y * size),
    ...row.map((value, x) => cellWithValue(at(state)(x, y))(value, setSolved)),
    ...board.slice((y + 1) * size)
  ];
  // console.log("setRow newBoard", newBoard);
  return setBoard(state)(newBoard);
};

const setRandomCellUnsolved = state => () => {
  const available = getBoard(state).filter(x => isCellSolved(x));
  const item = sample(available);
  console.log("cell", item, available);
  if (!item) {
    console.log("no item available!");
  }
  return setCell(state)({ ...item, solvedValue: null });
};

const init = state => ({ initState }) => {
  const board = [];
  let newState = state;
  const size = getSize(newState);
  for (let i = 0; i < size * size; ++i) {
    const x = i % size;
    const y = Math.floor(i / size);
    board.push(cell(x, y));
  }
  newState = setBoard(newState)(board);
  if (initState) {
    const rows = initState.split("\n");
    rows.forEach((element, i) => {
      newState = setRow(newState)(
        i,
        element.split("").map(x => {
          const number = Number(x);
          return isNaN(number) ? undefined : number;
        }),
        true
      );
    });
  }
  return newState;
};

const clear = state => () => {
  const board = getBoard(state);
  return setBoard(state)(board.map(item => clearCell(item)));
};

const updateCandidates = state => () => {
  const size = getSize(state);
  let newState = state;
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      const existing = getIntersectValuesAt(state)(x, y, true);
      newState = setCell(state)({
        ...existing,
        candidates: getListWithout(size)(existing)
      });
    }
  }
  return newState;
};

const DEFAULT_DIM = 3;

const initialState = {
  board: null,
  dim: DEFAULT_DIM
};

const reducer = (state = initialState, action) => {
  if (!action) {
    return state;
  }
  // console.log("reducer action:", action);
  switch (action.type) {
    case INIT:
      return init(state)(action.payload || {});
    case CLEAR:
      return clear(state)();
    case SET_ROW:
      return setRow(state)(action.payload);
    case SET_RANDOM_UNSOLVED:
      return setRandomCellUnsolved(state)();
    case UPDATE_CANDIDATES:
      return updateCandidates(state)();
    default:
      console.error("unknown action", action.type);
      return state;
  }
};

export default reducer;
