import {
  updateCandidates,
  iterateBlocks,
  isSolved,
  setCell,
  atBoard,
  isValid,
  getCellsWithCandidates
} from "../board/actions/board";
import { isSolved as isCellSolved, hasCandidates } from "../board/actions/cell";
import { sort } from "./utils";

const NAKED_SINGLE = "nakedSingle";
const NAKED_PAIR = "nakedPair";

const filterCandidates = degree => block => {
  const cells = block.filter(x => !isCellSolved(x) && hasCandidates(x)(degree));
  const seen = {};
  cells.forEach(cell => {
    const key = JSON.stringify(sort(cell.candidates));
    if (!seen[key]) {
      seen[key] = [];
    }
    seen[key].push(cell);
  });
  const reduced = Object.values(seen).reduce((acc, current) => {
    if (current.length === degree) {
      current.forEach(item => {
        if (item.candidates.length === degree) {
          acc.push(item);
        }
      });
    }
    return acc;
  }, []);
  return reduced;
};

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

    // TODO how to update candidates when steps remove candidates?
    board = updateCandidates(size)(board)();

    iterateBlocks(size)(board)((block, blockType) => {
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
      const nakedPairCandidates = filterCandidates(2)(block);
      nakedPairCandidates.forEach(candidate => {
        const cells = getCellsWithCandidates(candidate.candidates, block);
        cells.forEach(cell => {
          // TODO how to model naked pair and apply step
          const newStep = step(NAKED_PAIR, cell);
          const added = addStep(allSteps, newStep);
          if (added) {
            iterationInfo[iteration].steps.push(newStep);
            //console.log("add", newStep);
          }
        });
      });
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
