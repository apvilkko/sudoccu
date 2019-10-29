import * as R from "ramda";
import {
  getRow,
  getCol,
  iterateBlocks,
  getCellsWithCandidates,
  getCellsInBlockByCandidateValue
} from "../../board/actions/board";
import { step, X_WING } from "./common";

const xWing = (board, size) => addStep => {
  const candidates = {};
  iterateBlocks(size)(board)((block, blockType, blockIndex) => {
    if (blockType === "block") {
      return;
    }
    if (!candidates[blockType]) {
      candidates[blockType] = {};
    }
    for (let i = 0; i < size; ++i) {
      const value = i + 1;
      const biCandidates = getCellsInBlockByCandidateValue(value, 2, block, 2);
      candidates[blockType][value] = [
        ...(candidates[blockType][value] || []),
        ...biCandidates
      ];
    }
  });
  Object.keys(candidates).forEach(blockType => {
    Object.keys(candidates[blockType]).forEach(value => {
      const cands = candidates[blockType][value];
      if (cands.length) {
        const numberValue = Number(value);
        const xs = R.uniq(cands.map(c => c.x));
        const ys = R.uniq(cands.map(c => c.y));
        if (blockType === "row" && xs.length === 2) {
          // console.log(blockType, value, cands);
          xs.forEach(x => {
            const col = getCol(size)(board)(x);
            const possibleEliminations = getCellsWithCandidates(
              [numberValue],
              col
            ).filter(cell => !ys.includes(cell.y));
            if (possibleEliminations.length) {
              const newStep = step(X_WING, {
                tuple: [numberValue],
                cause: cands,
                eliminations: R.map(cell => ({
                  ...cell,
                  eliminatedCandidates: [value]
                }))(possibleEliminations)
              });
              addStep(newStep);
            }
          });
        } else if (blockType === "col" && ys.length === 2) {
          //console.log(blockType, value, cands);
          ys.forEach(y => {
            const row = getRow(size)(board)(y);
            const possibleEliminations = getCellsWithCandidates(
              [numberValue],
              row
            ).filter(cell => !xs.includes(cell.x));
            if (possibleEliminations.length) {
              const newStep = step(X_WING, {
                tuple: [numberValue],
                cause: cands,
                eliminations: R.map(cell => ({
                  ...cell,
                  eliminatedCandidates: [value]
                }))(possibleEliminations)
              });
              addStep(newStep);
            }
          });
        }
      }
    });
  });
};

export default xWing;
