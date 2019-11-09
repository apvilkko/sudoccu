import * as R from "ramda";
import {
  isSolved as isCellSolved,
  hasCandidates,
  getCandidates
} from "../../board/actions/cell";
import { sort } from "../utils";
import { uniq } from "../math";

export const NAKED = "naked";
export const HIDDEN = "hidden";
export const SINGLE = "Single";
export const PAIR = "Pair";
export const TRIPLE = "Triple";
export const QUAD = "Quad";
export const NAKED_SINGLE = NAKED + SINGLE;
export const HIDDEN_SINGLE = HIDDEN + SINGLE;
export const NAKED_PAIR = NAKED + PAIR;
export const HIDDEN_PAIR = HIDDEN + PAIR;
export const NAKED_TRIPLE = NAKED + TRIPLE;
export const HIDDEN_TRIPLE = HIDDEN + TRIPLE;
export const NAKED_QUAD = NAKED + QUAD;
export const HIDDEN_QUAD = HIDDEN + QUAD;
export const POINTING_PAIR = "pointing" + PAIR;
export const X_WING = "x-wing";

const getAvailableCandidates = block =>
  uniq(R.flatten(block.map(c => getCandidates(c))));

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

const sortByCoords = R.sortWith([R.ascend(R.prop("x")), R.ascend(R.prop("y"))]);

const mapPick = (key, keys) => data => {
  if (data && data[key]) {
    const sorter = keys.indexOf("x") > -1 ? sortByCoords : R.identity;
    return {
      ...data,
      [key]: sorter(R.map(R.pick(keys))(data[key]))
    };
  }
  return data;
};

const step = (type, data) => {
  const cleanStep = {
    type,
    ...R.pipe(
      mapPick("solved", ["x", "y", "value", "candidates"]),
      mapPick("eliminations", ["x", "y", "eliminatedCandidates"]),
      mapPick("cause", ["x", "y", "value", "candidates"])
    )(data)
  };
  return cleanStep;
};

// http://www.sudoku-help.com/SHD-Ratings.htm
const getCost = step => {
  switch (step.type) {
    case NAKED_SINGLE:
      return 1;
    case NAKED_PAIR:
      return 2;
    case NAKED_TRIPLE:
      return 3;
    case NAKED_QUAD:
      return 4;
    case HIDDEN_SINGLE:
      return 2;
    case HIDDEN_PAIR:
      return 4;
    case HIDDEN_TRIPLE:
      return 6;
    case HIDDEN_QUAD:
      return 8;
    case POINTING_PAIR:
      return 2;
    case X_WING:
      return 8;
    default:
      return 1;
  }
};

export { filterCandidates, step, getCost, getAvailableCandidates };
