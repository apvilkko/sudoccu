import * as R from "ramda";
import {
  updateCandidates,
  isSolved,
  setCell,
  atBoard,
  isValid
} from "../board/actions/board";
import { getCandidates } from "../board/actions/cell";
import { getCost } from "./strategies/common";
import STRATEGIES from "./strategies";

const min = arr => Math.min.apply(Math, arr);

const stepMin = prop => step => {
  if (step.solved) {
    return min(R.map(R.prop(prop))(step.solved));
  } else if (step.eliminations) {
    return min(R.map(R.prop(prop))(step.eliminations));
  }
};

const ascendRow = R.ascend(stepMin("y"));
const ascendCol = R.ascend(stepMin("x"));
const sortSteps = R.sortWith([ascendRow, ascendCol]);

/*const cleanStep = step => ({
  ...step,
  eliminations: sortByCoords(
    R.map(R.pick(["x", "y", "value"]))(step.eliminations || [])
  )
});*/

const STEP_SECTIONS = ["solved", "eliminations", "cause"];

const isEqualStep = (one, other) => {
  if (!one || !other) {
    return false;
  }
  if (one.type !== one.type) {
    return false;
  }
  for (let i = 0; i < STEP_SECTIONS.length; ++i) {
    const key = STEP_SECTIONS[i];
    if (one[key] || other[key]) {
      return R.equals(one[key], other[key]);
    }
  }
  //return R.equals(cleanStep(one), cleanStep(other));
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

const getDifficulty = steps => {
  return steps.reduce((acc, current) => {
    return acc + getCost(current);
  }, 0);
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

const applyStrategy = (steps, addStepFn, fn) => {
  const lenBefore = steps.length;
  fn(addStepFn);
  const lenAfter = steps.length;
  return lenAfter > lenBefore;
};

const solve = size => (boardToSolve, allowUnsolved) => {
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
    let successful = false;

    const addStepFn = newStep => {
      const added = addStep(allSteps, newStep);
      if (added) {
        iterationInfo[iteration].steps.push(newStep);
      }
    };

    const strategies = STRATEGIES.map(x => x(board, size));

    for (let s = 0; s < strategies.length; ++s) {
      /*console.log("SDC ***");
      console.log("SDC applying strategy", s);
      console.log("SDC ***");*/
      successful = applyStrategy(allSteps, addStepFn, strategies[s]);
      if (successful) {
        break;
      }
    }

    if (successful) {
      board = applySteps(size)(board)(
        sortSteps(iterationInfo[iteration].steps)
      );
      iteration++;
      continue;
    }

    console.log("bailing from solver at iteration", iteration);
    break;
  }

  if (!isSolved(board) && !allowUnsolved) {
    throw new Error("unsolvable");
  }

  return allSteps;
};

export { solve, getDifficulty, applySteps };
