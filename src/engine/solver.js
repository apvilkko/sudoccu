import * as R from "ramda";
import {
  updateCandidates,
  iterateBlocks,
  isSolved,
  setCell,
  atBoard,
  isValid,
  getCellsWithCandidates
} from "../board/actions/board";
import {
  isSolved as isCellSolved,
  hasCandidates,
  getCandidates
} from "../board/actions/cell";
import { sort } from "./utils";

export const NAKED_SINGLE = "nakedSingle";
export const NAKED_PAIR = "nakedPair";

const filterCandidates = degree => block => {
  const cells = block.filter(x => !isCellSolved(x) && hasCandidates(x)(degree));
  const seen = {};
  cells.forEach(cell => {
    const key = JSON.stringify(sort(getCandidates(cell)));
    if (!seen[key]) {
      seen[key] = [];
    }
    seen[key].push(cell);
  });

  /*const reduced = Object.values(seen).reduce((acc, current) => {
    if (current.length === degree) {
      current.forEach(item => {
        if (getCandidates(item).length === degree) {
          acc.push(item);
        }
      });
    }
    return acc;
  }, []); */
  return R.filter(
    a =>
      a.length === degree && R.all(b => getCandidates(b).length === degree)(a)
  )(seen);
};

const step = (type, data) => {
  const cleaned = data;
  if (data && data.solved) {
    cleaned.solved = R.map(R.omit(["solvedValue"]))(data.solved);
  }
  return {
    type,
    ...cleaned
  };
};

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
  return R.equals(one, other);
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
    // console.log("apply step", step);
    if (step.solved) {
      step.solved.forEach(solvedCell => {
        const cell = atBoard(size)(newBoard)(solvedCell.x, solvedCell.y);
        const newValue = {
          ...cell,
          solvedValue: getCandidates(solvedCell)[0],
          candidates: []
        };
        // console.log("newValue", JSON.stringify(newValue));
        newBoard = setCell(size)(newBoard)(newValue);
      });
    }
    if (step.eliminations) {
      step.eliminations.forEach(spec => {
        const cell = atBoard(size)(newBoard)(spec.x, spec.y);
        newBoard = setCell(size)(newBoard)({
          ...cell,
          candidates: R.without(spec.eliminatedCandidates)(getCandidates(cell))
        });
      });
    }
  });
  return newBoard;
};

const getTupleFromKey = key => {
  const match = key.match(/\[(\d+),(\d+)\]/);
  if (match) {
    return match.slice(1).map(Number);
  }
  return [];
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

    iterateBlocks(size)(board)((block, blockType) => {
      // Find naked singles
      const singleCandidates = filterCandidates(1)(block);
      Object.values(singleCandidates).forEach(candidate => {
        const newStep = step(NAKED_SINGLE, { solved: candidate });
        const added = addStep(allSteps, newStep);
        if (added) {
          iterationInfo[iteration].steps.push(newStep);
        }
      });

      // Find naked pairs
      const nakedPairCandidates = filterCandidates(2)(block);
      // console.log("nakedPairCandidates", nakedPairCandidates);
      Object.keys(nakedPairCandidates).forEach(pair => {
        const pairCandidate = getTupleFromKey(pair);
        // console.log("pairCandidate", pairCandidate);
        const cells = getCellsWithCandidates(pairCandidate, block);
        if (!R.isEmpty(cells)) {
          const newStep = step(NAKED_PAIR, {
            tuple: pairCandidate,
            cause: nakedPairCandidates[pair],
            blockType,
            eliminations: R.map(cell => ({
              ...cell,
              eliminatedCandidates: R.intersection(
                getCandidates(cell),
                pairCandidate
              )
            }))(cells)
          });
          const added = addStep(allSteps, newStep);
          if (added) {
            iterationInfo[iteration].steps.push(newStep);
            // console.log("add", JSON.stringify(newStep, null, 2));
          }
        }
      });
    });

    board = applySteps(size)(board)(iterationInfo[iteration].steps);

    if (iterationInfo[iteration].steps.length === 0) {
      console.log("bailing from solver at iteration", iteration);
      break;
    }
    iteration++;
  }

  if (!isSolved(board)) {
    throw new Error("unsolvable");
  }

  return allSteps;
};

export { solve, getDifficulty, filterCandidates, applySteps };
