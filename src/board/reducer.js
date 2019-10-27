import * as R from "ramda";
import {
  INIT,
  SET_BOARD,
  UPDATE_CANDIDATES,
  APPLY_STEPS,
  HIGHLIGHT,
  ENTER_NUMBER,
  UNDO,
  KEY_EVENT,
  SET_PENCIL
} from "./actions/constants";
import {
  init as initBoard,
  updateCandidates,
  atBoard,
  setCell
} from "./actions/board";
import { getSize, getBoard } from "./selectors";
import { applySteps } from "../engine/solver";
import { sort } from "../engine/utils";

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
  highlight: {},
  pencil: false
};

const toReadonlyValues = arr =>
  arr.map(x => ({ ...x, readonly: !!x.solvedValue }));

const updateCandidatesAction = (state, action) => {
  const board = getBoard(state);
  return setBoard(state)(
    updateCandidates(getSize(state))(board)(
      ((action || {}).payload || {}).solved
    )
  );
};

const undoBuffer = [];

const undo = state => {
  // console.log("undo", undoBuffer);
  if (undoBuffer.length) {
    return undoBuffer.pop();
  }
  return state;
};

const setHighlight = (state, action) => {
  const cell = action.payload.cell;
  const off = state.highlight.x === cell.x && state.highlight.y === cell.y;
  return {
    ...state,
    highlight: off ? {} : { x: cell.x, y: cell.y, value: cell.solvedValue }
  };
};

const handleEnterNumber = (state, action) => {
  //console.log("handleEnterNumber", action);
  const highlight = state.highlight;
  if (R.isEmpty(highlight)) {
    return state;
  }
  const size = getSize(state);
  const board = getBoard(state);
  const cell = atBoard(size)(board)(highlight.x, highlight.y);
  //console.log("ENTER_NUMBER cell", cell, state.pencil);
  if (cell.readonly) {
    return state;
  }
  const value = action.payload.value;
  if (typeof value !== "number") {
    throw new Error("ENTER_NUMBER bad value");
  }
  let newCell;
  if (state.pencil) {
    const removing = cell.solvedCandidates.includes(value);
    const solvedCandidates = removing
      ? R.without([value])(cell.solvedCandidates)
      : sort([...cell.solvedCandidates, value]);
    newCell = { ...cell, solvedCandidates };
  } else {
    newCell = { ...cell, solvedValue: value };
  }
  const newState = setBoard(state)(setCell(size)(board)(newCell));
  const afterFn = state.pencil
    ? x => x
    : s => updateCandidatesAction(s, { payload: { solved: true } });
  const ret = afterFn(newState);
  undoBuffer.push(state);
  return {
    ...ret,
    highlight: { ...state.highlight, value: newCell.solvedValue }
  };
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
      //console.log("SET_BOARD", action.payload);
      return setBoard(state)(toReadonlyValues(action.payload));
    }
    /* case SET_RANDOM_UNSOLVED:
      return setRandomCellUnsolved(state)(); */
    case APPLY_STEPS: {
      const size = getSize(state);
      const board = getBoard(state);
      return setBoard(state)(applySteps(size)(board)(action.payload));
    }
    case UPDATE_CANDIDATES: {
      return updateCandidatesAction(state, action);
    }
    case HIGHLIGHT: {
      return setHighlight(state, action);
    }
    case ENTER_NUMBER: {
      return handleEnterNumber(state, action);
    }
    case UNDO: {
      return undo(state);
    }
    case SET_PENCIL: {
      return {
        ...state,
        pencil:
          typeof action.payload === "undefined" ? !state.pencil : action.payload
      };
    }
    case KEY_EVENT: {
      const key = action.payload.value;
      const hasHighlight = !R.isEmpty(state.highlight);
      const size = getSize(state);
      const adjust = (obj, prop, amount, max) => ({
        ...obj,
        [prop]:
          (max && obj[prop] < max) || (!max && obj[prop] > 0)
            ? obj[prop] + amount
            : obj[prop]
      });

      const isArrow = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
      ].includes(key);
      const isNumber = !isNaN(Number(key));
      let newState = { ...state };
      if (isArrow && !hasHighlight) {
        const firstCell = atBoard(size)(getBoard(state))(0, 0);
        newState = setHighlight(newState, { payload: { cell: firstCell } });
      } else if (isNumber) {
        return handleEnterNumber(newState, { payload: { value: Number(key) } });
      }

      const at = atBoard(size)(getBoard(newState));
      switch (key) {
        case "Delete":
          return undo(newState);
        case "ArrowLeft": {
          const adjusted = adjust(newState.highlight, "x", -1);
          return setHighlight(newState, {
            payload: { cell: at(adjusted.x, adjusted.y) }
          });
        }
        case "ArrowRight": {
          const adjusted = adjust(newState.highlight, "x", +1, size - 1);
          return setHighlight(newState, {
            payload: { cell: at(adjusted.x, adjusted.y) }
          });
        }
        case "ArrowUp": {
          const adjusted = adjust(newState.highlight, "y", -1);
          return setHighlight(newState, {
            payload: { cell: at(adjusted.x, adjusted.y) }
          });
        }
        case "ArrowDown": {
          const adjusted = adjust(newState.highlight, "y", +1, size - 1);
          return setHighlight(newState, {
            payload: { cell: at(adjusted.x, adjusted.y) }
          });
        }
        default:
          return newState;
      }
    }
    default:
      console.error("unknown action", action.type);
      return state;
  }
};

export default reducer;
