import {
  INIT,
  SET_BOARD,
  UPDATE_CANDIDATES,
  APPLY_STEPS,
  HIGHLIGHT
} from "./actions/constants";
import { init as initBoard, updateCandidates } from "./actions/board";
import { getSize, getBoard } from "./selectors";
import { applySteps } from "../engine/solver";

const setBoard = state => board => {
  if (!Array.isArray(board)) {
    throw new Error("setBoard not valid board" + typeof board);
  }
  return {
    ...state,
    board
  };
};

const init = state => ({ initState }) => {
  const board = initBoard(getSize(state))(initState);
  return setBoard(state)(board);
};

const DEFAULT_DIM = 3;

const initialState = {
  board: null,
  dim: DEFAULT_DIM,
  highlight: {}
};

const reducer = (state = initialState, action) => {
  if (!action) {
    return state;
  }
  // console.log("reducer action:", action);
  switch (action.type) {
    case INIT:
      return init(state)(action.payload || {});
    /* case CLEAR:
      return clear(state)(); */
    /*case SET_ROW:
      return setRow(state)(action.payload);*/
    case SET_BOARD: {
      console.log("SET_BOARD", action.payload);
      return setBoard(state)(action.payload);
    }
    /* case SET_RANDOM_UNSOLVED:
      return setRandomCellUnsolved(state)(); */
    case APPLY_STEPS: {
      const size = getSize(state);
      const board = getBoard(state);
      return setBoard(state)(applySteps(size)(board)(action.payload));
    }
    case UPDATE_CANDIDATES: {
      const board = getBoard(state);
      return setBoard(state)(updateCandidates(getSize(state))(board)());
    }
    case HIGHLIGHT: {
      const cell = action.payload.cell;
      const off = state.highlight.x === cell.x && state.highlight.y === cell.y;
      return {
        ...state,
        highlight: off ? {} : { x: cell.x, y: cell.y, value: cell.solvedValue }
      };
    }
    default:
      console.error("unknown action", action.type);
      return state;
  }
};

export default reducer;
