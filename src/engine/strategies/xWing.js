import * as R from "ramda";
import {
  getRow,
  getCol,
  iterateBlocks,
  getCellsWithCandidates,
  getCellsInBlockByCandidateValue
} from "../../board/actions/board";
import { step, X_WING, getAvailableCandidates } from "./common";

const BLOCKTYPES = ["row", "col"];
const GETTERS = {
  y: getRow,
  x: getCol
};

const xWing = (board, size) => addStep => {
  const candidates = [];
  const availableCandidateValues = [];
  iterateBlocks(size)(board)((block, blockType) => {
    if (blockType === "box") {
      return;
    }
    const availableCandidates = getAvailableCandidates(block);
    for (let i = 0; i < availableCandidates.length; ++i) {
      const value = availableCandidates[i];
      const biCandidates = getCellsInBlockByCandidateValue(value, 2, block, 2);
      if (biCandidates.length) {
        candidates.push({ blockType, value, candidates: biCandidates });
        availableCandidateValues.push(value);
      }
    }
  });
  for (let value = 0; value < availableCandidateValues.length; ++value) {
    const filtered = candidates.filter(a => a.value === value);
    if (filtered.length < 2) {
      continue;
    }
    for (let b = 0; b < BLOCKTYPES.length; ++b) {
      const blType = BLOCKTYPES[b];
      const byType = filtered.filter(a => a.blockType === blType);
      if (byType.length < 2) {
        continue;
      }
      // If checking in column direction we check that y coords align
      const checkProp = blType === "col" ? "y" : "x";
      const otherProp = checkProp === "x" ? "y" : "x";
      let i = 0;
      let item;
      while (i < byType.length) {
        item = byType[i];
        for (let j = i + 1; j < byType.length; ++j) {
          const coords = [
            item.candidates.map(R.prop(checkProp)),
            byType[j].candidates.map(R.prop(checkProp))
          ];
          if (R.equals(coords[0], coords[1])) {
            const otherCoords = [
              item.candidates.map(R.prop(otherProp))[0],
              byType[j].candidates.map(R.prop(otherProp))[0]
            ];
            let possibleEliminations = [];
            coords[0].forEach(z => {
              const line = GETTERS[checkProp](size)(board)(z);
              const possible = getCellsWithCandidates([value], line).filter(
                cell => !otherCoords.includes(cell[otherProp])
              );
              if (possible.length) {
                possibleEliminations = [...possibleEliminations, ...possible];
              }
            });
            if (possibleEliminations.length) {
              const newStep = step(X_WING, {
                tuple: [value],
                cause: [...item.candidates, ...byType[j].candidates],
                eliminations: R.map(cell => ({
                  ...cell,
                  eliminatedCandidates: [value]
                }))(possibleEliminations)
              });
              addStep(newStep);
            }
          }
        }
        i++;
      }
    }
  }
};

export default xWing;
