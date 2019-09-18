import * as R from "ramda";
import {
  updateCandidates,
  iterateBlocks,
  isSolved,
  setCell,
  atBoard,
  isValid,
  getCellsWithCandidates,
  getCellsInBlockByCandidateValue,
  getRow,
  getCol
} from "../board/actions/board";
import {
  isSolved as isCellSolved,
  hasCandidates,
  getCandidates
} from "../board/actions/cell";
import { sort } from "./utils";

export const NAKED_SINGLE = "nakedSingle";
export const NAKED_PAIR = "nakedPair";
export const POINTING_PAIR = "pointingPair";

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
const sortSteps = steps => R.sortWith([ascendRow, ascendCol], steps);

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
    case NAKED_PAIR:
      return 2;
    case POINTING_PAIR:
      return 2;
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

const applyStrategy = (steps, fn) => {
  const lenBefore = steps.length;
  fn(steps);
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

    const strategies = [
      // Naked singles
      steps => {
        iterateBlocks(size)(board)(block => {
          const singleCandidates = filterCandidates(1)(block);
          Object.values(singleCandidates).forEach(candidate => {
            const newStep = step(NAKED_SINGLE, { solved: candidate });
            const added = addStep(steps, newStep);
            if (added) {
              iterationInfo[iteration].steps.push(newStep);
            }
          });
        });
      },

      // Naked pairs
      steps => {
        iterateBlocks(size)(board)((block, blockType) => {
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
              const added = addStep(steps, newStep);
              if (added) {
                iterationInfo[iteration].steps.push(newStep);
                // console.log("add", JSON.stringify(newStep, null, 2));
              }
            }
          });
        });
      },

      // Naked triples
      // Hidden pairs
      // Hidden triples
      // Naked quads
      // Hidden quads

      // Pointing pairs
      steps => {
        iterateBlocks(size)(board)((block, blockType, blockIndex) => {
          if (blockType !== "block") {
            return;
          }
          for (let i = 0; i < size; ++i) {
            const value = i + 1;
            const candidates = getCellsInBlockByCandidateValue(
              value,
              2,
              block,
              3
            );
            const directions = [["y", "x", getRow], ["x", "y", getCol]];

            directions.forEach(([sameProp, existProp, getter]) => {
              const isSame =
                R.uniq(R.map(R.prop(sameProp))(candidates)).length === 1;

              if (isSame) {
                const candidateBlock = getter(size)(board)(
                  candidates[0][sameProp]
                );
                const existing = R.map(R.prop(existProp))(candidates);
                const cells = getCellsWithCandidates(
                  [value],
                  candidateBlock
                ).filter(cell => !existing.includes(cell[existProp]));
                if (cells.length > 0) {
                  const newStep = step(POINTING_PAIR, {
                    tuple: [value],
                    cause: candidates,
                    eliminations: R.map(cell => ({
                      ...cell,
                      eliminatedCandidates: [value]
                    }))(cells)
                  });
                  const added = addStep(steps, newStep);
                  if (added) {
                    iterationInfo[iteration].steps.push(newStep);
                  }
                }
              }
            });
          }
        });
      }

      // Box/line reduction

      // X-wing
      // Simple colouring
      // Y-wing
      // Swordfish
      // XYZ-wing

      /*
      X-Cycles
      BUG
      XY-Chain
      3D Medusa
      Jellyfish
      Unique Rectangles
      Extended Unique Rect.
      Hidden Unique Rect's
      WXYZ Wing
      Aligned Pair Exclusion

      Exocet
      Grouped X-Cycles
      Empty Rectangles
      Finned X-Wing
      Finned Swordfish
      Altern. Inference Chains
      Sue-de-Coq
      Digit Forcing Chains
      Nishio Forcing Chains
      Cell Forcing Chains
      Unit Forcing Chains
      Almost Locked Sets
      Death Blossom
      Pattern Overlay Method
      Quad Forcing Chains
      */
    ];

    for (let s = 0; s < strategies.length; ++s) {
      successful = applyStrategy(allSteps, strategies[s]);
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

export { solve, getDifficulty, filterCandidates, applySteps };
