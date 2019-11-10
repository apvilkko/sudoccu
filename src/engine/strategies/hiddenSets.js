import * as R from "ramda";
import {
  iterateBlocks,
  getAllCellsWithCandidate
} from "../../board/actions/board";
import {
  step,
  getAvailableCandidates,
  NAKED,
  HIDDEN,
  SINGLE,
  PAIR,
  TRIPLE,
  QUAD
} from "./common";
import { getCombinations } from "../math";
import { getCandidates } from "../../board/actions/cell";

const hiddenSets = (degree, desiredType) => (board, size) => addStep => {
  iterateBlocks(size)(board)((block, blockType, blockIndex) => {
    /*console.log(
      "SDC block",
      blockType,
      blockIndex,
      block.map((b, i) => `{${b.x},${b.y}:${b.candidates}}`).join("")
    );*/
    const availableCandidates = getAvailableCandidates(block);
    const combinations = getCombinations(availableCandidates, degree);

    //console.log("SDC available", availableCandidates, combinations);

    const cands = {};

    for (let i = 0; i < availableCandidates.length; ++i) {
      const value = availableCandidates[i];
      const candidates = getAllCellsWithCandidate(
        value,
        block,
        degree === 1 ? 1 : 2,
        desiredType === NAKED ? degree : 999
      );
      if (candidates.length === 0) {
        //console.log("SDC bail 0");
        continue;
      }
      const maxCands = R.reduce(
        R.max,
        0,
        candidates.map(c => c.candidates.length)
      );
      const type = degree >= maxCands ? NAKED : HIDDEN;
      cands[value] = { value, type, candidates };
    }

    for (let comb = 0; comb < combinations.length; ++comb) {
      const combination = combinations[comb];

      const candsForValue = combination.map(c => cands[c]);

      // Check that all combination candidates are available
      if (R.any(R.isNil)(candsForValue)) {
        /*if (true) {
          console.log(
            "SDC bail 1",
            blockType,
            blockIndex,
            JSON.stringify(combination),
            JSON.stringify(candsForValue)
          );
        }*/
        continue;
      }

      const uniqCoords = R.pipe(
        R.map(R.prop("candidates")),
        R.flatten,
        R.map(c => [c.x, c.y]),
        R.uniq
      )(candsForValue);

      // Check that cell coordinates match between candidates
      if (uniqCoords.length > degree) {
        /*if (true) {
          console.log(
            "SDC bail 2",
            blockType,
            blockIndex,
            JSON.stringify(combination),
            JSON.stringify(candsForValue),
            JSON.stringify(uniqCoords)
          );
        }*/

        continue;
      }

      let valid = true;
      let possibleEliminations = [];
      let debugInfo = "";

      for (let i = 0; i < block.length; ++i) {
        const cell = block[i];
        const cellCands = getCandidates(cell);
        const isCandidateCell = R.includes([cell.x, cell.y], uniqCoords);
        if (
          (!isCandidateCell && desiredType === HIDDEN) ||
          (isCandidateCell && desiredType === NAKED)
        ) {
          // Check that combination values are contained in candidate cells only
          let invalid;
          if (desiredType === NAKED) {
            invalid = R.without(combination, cellCands).length > 0;
          }
          for (let i = 0; i < combination.length; ++i) {
            const value = combination[i];
            if (desiredType === HIDDEN) {
              invalid = cellCands.includes(value);
            }

            if (invalid) {
              valid = false;
              debugInfo = `${JSON.stringify(cellCands)} incl ${value} @ ${
                cell.x
              },${cell.y}`;
              break;
            }
          }
        }
        if (degree > 1) {
          // Collect possible eliminations
          let possible = [];
          if (!isCandidateCell) {
            possible = R.intersection(combination, cellCands);
          }
          if (isCandidateCell && desiredType === HIDDEN) {
            possible = R.without(combination, cellCands);
          }
          if (possible.length) {
            possibleEliminations.push({
              ...cell,
              eliminatedCandidates: possible
            });
          }
        }
      }

      if (degree > 1 && (!valid || possibleEliminations.length === 0)) {
        /*if (true) {
          console.log(
            "SDC bail 3",
            blockType,
            blockIndex,
            JSON.stringify(combination),
            JSON.stringify(candsForValue),
            JSON.stringify(uniqCoords),
            JSON.stringify(possibleEliminations),
            "debugInfo: " + debugInfo
          );
        }*/
        continue;
      }

      const tuple = candsForValue.map(R.prop("value"));
      const type = desiredType;
      const tupleType =
        degree === 1
          ? SINGLE
          : degree === 2
          ? PAIR
          : degree === 3
          ? TRIPLE
          : QUAD;

      if (desiredType === type) {
        const payload =
          degree === 1
            ? { blockType, solved: candsForValue[0].candidates }
            : {
                blockType,
                eliminations: possibleEliminations,
                cause: uniqCoords.map(c => ({ x: c[0], y: c[1] }))
              };

        const newStep = step(type + tupleType, {
          tuple,
          ...payload
        });
        /*if (degree > 1) {
          console.log(
            "SDC add step",
            type + tupleType,
            tuple,
            JSON.stringify(payload)
          );
        }*/

        addStep(newStep);
      }
    }
  });
};

export default hiddenSets;
