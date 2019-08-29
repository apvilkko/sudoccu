import { INIT, CLEAR, SET_ROW } from "./actions";
import { getSize, getBoard, at, isCellSolved, getIndex } from "./selectors";

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
  return setBoard(state)([
    ...board.slice(0, y * size),
    ...row.map((value, x) => cellWithValue(at(state)(x, y))(value, setSolved)),
    ...board.slice((y + 1) * size)
  ]);
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

const DEFAULT_DIM = 3;

const initialState = {
  board: null,
  dim: DEFAULT_DIM
};

const reducer = (state = initialState, action) => {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case INIT:
      return init(state)(action.payload || {});
    case CLEAR:
      return clear(state)();
    case SET_ROW:
      return setRow(state)(action.payload);
    default:
      console.error("unknown action", action.type);
      return state;
  }
};

export default reducer;
