import { getBoard, isValid, isSolved } from "../board/selectors";
import { UPDATE_CANDIDATES } from "../board/actions";

const NAKED_SINGLE = "nakedSingle";

const filterCandidates = degree => block =>
  block.filter(x => !x.isSolved() && x.hasCandidates(degree));

const step = (type, cell) => ({
  type,
  cell
});

// http://www.sudoku-help.com/SHD-Ratings.htm
const getCost = step => {
  switch (step.type) {
    case NAKED_SINGLE:
      return 1;
    default:
      return 1;
  }
};

const getDifficulty = steps => {
  return steps.reduce((acc, current) => {
    return acc + getCost(current);
  }, 0);
};

const blockCheck = (board, handler) => {
  for (let i = 0; i < board.size; ++i) {
    handler(board.row(i));
    handler(board.col(i));
    handler(board.block(i));
  }
};

const isEqualStep = (one, other) => {
  return (
    one.type === other.type &&
    one.cell.x === other.cell.x &&
    one.cell.y === other.cell.y
  );
};

const addStep = (steps, step) => {
  for (let i = 0; i < steps.length; ++i) {
    if (isEqualStep(step, steps[i])) {
      return;
    }
  }
  steps.push(step);
};

const solve = store => {
  const steps = [];
  const state = store.getState();
  const board = getBoard(state);

  // Check validity first
  if (!isValid(state)()) {
    throw new Error("invalid board state");
  }

  // If board is already solved, no need to do anything.
  if (!isSolved(state)()) {
    store.dispatch({ type: UPDATE_CANDIDATES });

    // Find naked singles
    blockCheck(board, block => {
      const singleCandidates = filterCandidates(1)(block);
      singleCandidates.forEach(candidate => {
        addStep(steps, step(NAKED_SINGLE, candidate));
      });
    });
  }

  return steps;
};

export { solve, getDifficulty };
