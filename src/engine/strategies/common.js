import * as R from "ramda";
import {
  isSolved as isCellSolved,
  hasCandidates,
  getCandidates
} from "../../board/actions/cell";
import { sort } from "../utils";

export const NAKED_SINGLE = "nakedSingle";
export const NAKED_PAIR = "nakedPair";
export const POINTING_PAIR = "pointingPair";
export const X_WING = "x-wing";

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
    case X_WING:
      return 4;
    default:
      return 1;
  }
};

export { filterCandidates, step, getCost };
