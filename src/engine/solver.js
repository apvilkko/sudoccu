import {
  updateCandidates,
  iterateBlocks,
  isSolved,
  setCell,
  atBoard,
  isValid
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
      return false;
    }
  }
  steps.push(step);
  return true;
};

const applySteps = size => board => steps => {
  let newBoard = board;
  steps.forEach(step => {
    const cell = atBoard(size)(board)(step.cell.x, step.cell.y);
    // console.log("applying", cell, step.cell.x, step.cell.y, cell.candidates[0]);
    newBoard = setCell(size)(board)({
      ...cell,
      solvedValue: cell.candidates[0]
    });
  });
  return newBoard;
};

const solve = size => boardToSolve => {
  let board = boardToSolve;

  // Check validity first
  if (!isValid(size)(board)()) {
    throw new Error("invalid board state");
  }

  let iterationInfo = [];
  const allSteps = [];
  let iteration = 0;

  while (true) {
    iterationInfo.push({ steps: [] });

    // If board is already solved, no need to do anything.
    if (isSolved(board)) {
      break;
    }

    board = updateCandidates(size)(board)();

    iterateBlocks(size)(board)(block => {
      // Find naked singles
      const singleCandidates = filterCandidates(1)(block);
      singleCandidates.forEach(candidate => {
        const newStep = step(NAKED_SINGLE, candidate);
        const added = addStep(allSteps, newStep);
        if (added) {
          iterationInfo[iteration].steps.push(newStep);
        }
      });

      // Find naked pairs
      // TODO
      const nakedPairCandidates = filterCandidates(2)(block);
    });

    if (iterationInfo[iteration].steps.length === 0) {
      console.log("bailing from solver at iteration", iteration);
      break;
    } else {
      board = applySteps(size)(board)(iterationInfo[iteration].steps);
    }
    iteration++;
  }

  return allSteps;
};

export { solve, getDifficulty, filterCandidates };
