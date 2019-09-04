import { INIT, SET_BOARD } from "./actions/constants";
import { init as initBoard } from "./actions/board";
import { getSize } from "./selectors";

const setBoard = state => board => ({
  ...state,
  board
});

const init = state => ({ initState }) => {
  const board = initBoard(getSize(state))(initState);
  return setBoard(state)(board);
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
    /* case CLEAR:
      return clear(state)(); */
    /*case SET_ROW:
      return setRow(state)(action.payload);*/
    case SET_BOARD:
      return setBoard(state)(action.payload);
    /* case SET_RANDOM_UNSOLVED:
      return setRandomCellUnsolved(state)(); */
    /* case UPDATE_CANDIDATES:
      return updateCandidates(state)(); */
    default:
      console.error("unknown action", action.type);
      return state;
  }
};

export default reducer;
