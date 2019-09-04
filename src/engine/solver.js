import { getBoard, isValid, getSize } from "../board/selectors";
import {
  updateCandidates,
  iterateBlocks,
  isSolved
} from "../board/actions/board";
import { isSolved as isCellSolved, hasCandidates } from "../board/actions/cell";

const NAKED_SINGLE = "nakedSingle";

const filterCandidates = degree => block =>
  block.filter(x => !isCellSolved(x) && hasCandidates(x)(degree));

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

const solve = state => {
  const steps = [];
  let board = getBoard(state);
  const size = getSize(state);

  // Check validity first
  if (!isValid(state)()) {
    throw new Error("invalid board state");
  }

  // If board is already solved, no need to do anything.
  if (!isSolved(board)) {
    board = updateCandidates(size)(board)();

    // Find naked singles
    iterateBlocks(size)(board)(block => {
      const singleCandidates = filterCandidates(1)(block);
      singleCandidates.forEach(candidate => {
        addStep(steps, step(NAKED_SINGLE, candidate));
      });
    });
  }

  return steps;
};

export { solve, getDifficulty };
