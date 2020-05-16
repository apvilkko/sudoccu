import * as R from 'ramda'
import {
  INIT,
  SET_BOARD,
  UPDATE_CANDIDATES,
  APPLY_STEPS,
  HIGHLIGHT,
  ENTER_NUMBER,
  UNDO,
  KEY_EVENT,
  SET_PENCIL,
} from './actions/constants'
import { init as initBoard, atBoard, setCell } from './actions/board'
import { getSize, getBoard } from './selectors'
import { applySteps } from '../engine/solver'
import { sort } from '../engine/utils'
import {
  getBoardValue,
  EMPTY,
  setValueToBoardXy,
  setCandidatesAt,
} from '../v2/engine/board'
import { updateCandidates } from '../v2/engine/candidates'

const setBoard = (state) => (board) => {
  /*if (!Array.isArray(board)) {
    throw new Error('setBoard not valid board' + typeof board)
  }*/
  return {
    ...state,
    board,
  }
}

const init = (state) => ({ initState }) => {
  const board = initBoard(getSize(state))(initState)
  return setBoard(state)(board)
}

const DEFAULT_DIM = 3

const initialState = {
  board: null,
  dim: DEFAULT_DIM,
  highlight: {},
  pencil: false,
}

const toReadonlyValues = (arr) =>
  arr.map((x) => ({ ...x, readonly: !!x.solvedValue }))

const updateCandidatesAction = (state, action) => {
  const board = getBoard(state)
  const newPlayerBoard = { ...board.playerBoard }
  updateCandidates(newPlayerBoard)
  return setBoard(state)({ ...board, playerBoard: newPlayerBoard })
}

const undoBuffer = []

const undo = (state) => {
  // console.log("undo", undoBuffer);
  if (undoBuffer.length) {
    return undoBuffer.pop()
  }
  return state
}

const setHighlight = (state, action) => {
  const { value, x, y } = action.payload
  const off = state.highlight.x === x && state.highlight.y === y
  return {
    ...state,
    highlight: off ? {} : { x, y, value: Number(value) },
  }
}

const handleEnterNumber = (state, action) => {
  //console.log("handleEnterNumber", action);
  const highlight = state.highlight
  const { x, y } = highlight
  if (R.isEmpty(highlight)) {
    return state
  }
  const size = getSize(state)
  const board = getBoard(state)
  //const cell = atBoard(size)(board)(highlight.x, highlight.y)
  const candidates = board.playerBoard.candidates[y * size + x] || []
  const initialCell = board.initialBoard[y * size + x]
  //console.log("ENTER_NUMBER cell", cell, state.pencil);
  if (initialCell !== EMPTY) {
    return state
  }
  const value = action.payload.value
  if (typeof value !== 'number') {
    throw new Error('ENTER_NUMBER bad value')
  }
  let newValue
  let newCandidates = candidates
  if (state.pencil) {
    const removing = candidates.includes(value)
    newCandidates = removing
      ? R.without([value])(candidates)
      : sort([...candidates, value])
  } else {
    newValue = value
  }
  //const newState = setBoard(state)(setCell(size)(board)(newCell))
  const newPlayerBoard = {
    ...board.playerBoard,
    candidates: setCandidatesAt(
      board.playerBoard.candidates,
      x,
      y,
      newCandidates
    ),
  }
  if (!state.pencil) {
    setValueToBoardXy(newPlayerBoard, x, y, value)
  }
  const newState = setBoard(state)({
    ...board,
    playerBoard: newPlayerBoard,
  })
  const afterFn = state.pencil ? (x) => x : (s) => updateCandidatesAction(s)
  const ret = afterFn(newState)
  undoBuffer.push(state)
  return {
    ...ret,
    highlight: { ...state.highlight, value: newValue },
  }
}

const reducer = (state = initialState, action) => {
  if (!action) {
    return state
  }
  // console.log("reducer action:", action);
  switch (action.type) {
    case INIT:
      return init(state)(action.payload || {})
    /* case CLEAR:
      return clear(state)(); */
    /*case SET_ROW:
      return setRow(state)(action.payload);*/
    case SET_BOARD: {
      //console.log('SET_BOARD', action.payload)
      //return setBoard(state)(toReadonlyValues(action.payload))
      return setBoard(state)(action.payload)
    }
    /* case SET_RANDOM_UNSOLVED:
      return setRandomCellUnsolved(state)(); */
    case APPLY_STEPS: {
      const size = getSize(state)
      const board = getBoard(state)
      return setBoard(state)(applySteps(size)(board)(action.payload))
    }
    case UPDATE_CANDIDATES: {
      return updateCandidatesAction(state, action)
    }
    case HIGHLIGHT: {
      return setHighlight(state, action)
    }
    case ENTER_NUMBER: {
      return handleEnterNumber(state, action)
    }
    case UNDO: {
      return undo(state)
    }
    case SET_PENCIL: {
      return {
        ...state,
        pencil:
          typeof action.payload === 'undefined'
            ? !state.pencil
            : action.payload,
      }
    }
    case KEY_EVENT: {
      const key = action.payload.value
      const hasHighlight = !R.isEmpty(state.highlight)
      const size = getSize(state)
      const adjust = (obj, prop, amount, max) => ({
        ...obj,
        [prop]:
          (max && obj[prop] < max) || (!max && obj[prop] > 0)
            ? obj[prop] + amount
            : obj[prop],
      })
      const boardValue = (adjusted) =>
        getBoardValue(getBoard(state).playerBoard, adjusted.x, adjusted.y)

      const isArrow = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ].includes(key)
      const isNumber = !isNaN(Number(key))
      let newState = { ...state }
      if (isArrow && !hasHighlight) {
        //const firstCell = atBoard(size)(getBoard(state))(0, 0)
        const value = getBoard(state).playerBoard.data[0]
        newState = setHighlight(newState, { payload: { value, x: 0, y: 0 } })
      } else if (isNumber) {
        return handleEnterNumber(newState, { payload: { value: Number(key) } })
      }

      const at = atBoard(size)(getBoard(newState))
      switch (key) {
        case 'Delete':
          return undo(newState)
        case 'ArrowLeft': {
          const adjusted = adjust(newState.highlight, 'x', -1)
          return setHighlight(newState, {
            payload: { ...adjusted, value: boardValue(adjusted) },
          })
        }
        case 'ArrowRight': {
          const adjusted = adjust(newState.highlight, 'x', +1, size - 1)
          return setHighlight(newState, {
            payload: { ...adjusted, value: boardValue(adjusted) },
          })
        }
        case 'ArrowUp': {
          const adjusted = adjust(newState.highlight, 'y', -1)
          return setHighlight(newState, {
            payload: { ...adjusted, value: boardValue(adjusted) },
          })
        }
        case 'ArrowDown': {
          const adjusted = adjust(newState.highlight, 'y', +1, size - 1)
          return setHighlight(newState, {
            payload: { ...adjusted, value: boardValue(adjusted) },
          })
        }
        default:
          return newState
      }
    }
    default:
      console.error('unknown action', action.type)
      return state
  }
}

export default reducer
