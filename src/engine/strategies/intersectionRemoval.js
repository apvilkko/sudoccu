import * as R from "ramda";
import {
  getRow,
  getCol,
  iterateBlocks,
  getCellsWithCandidates,
  getCellsInBlockByCandidateValue,
  getBoxIndex,
  getBox
} from "../../board/actions/board";
import {
  step,
  POINTING_PAIR,
  getAvailableCandidates,
  POINTING_TRIPLE,
  POINTING,
  BOX_LINE_REDUCTION
} from "./common";
import { uniq } from "../math";

const intersectionRemoval = strategy => (board, size) => addStep => {
  iterateBlocks(size)(board)((block, blockType) => {
    const availableCandidates = getAvailableCandidates(block);
    for (let i = 0; i < availableCandidates.length; ++i) {
      const value = availableCandidates[i];
      const candidates = getCellsInBlockByCandidateValue(value, 2, block, 3);
      const degree = candidates.length;

      if (blockType === "box" && strategy === POINTING) {
        // Test pointing pair/triple
        const directions = [["y", "x", getRow], ["x", "y", getCol]];
        directions.forEach(([sameProp, existProp, getter]) => {
          const isSame = uniq(R.map(R.prop(sameProp))(candidates)).length === 1;

          if (isSame) {
            const candidateBlock = getter(size)(board)(candidates[0][sameProp]);
            const existing = R.map(R.prop(existProp))(candidates);
            const cells = getCellsWithCandidates(
              [value],
              candidateBlock
            ).filter(cell => !existing.includes(cell[existProp]));
            if (cells.length) {
              const newStep = step(
                degree === 2 ? POINTING_PAIR : POINTING_TRIPLE,
                {
                  tuple: [value],
                  cause: candidates,
                  eliminations: R.map(cell => ({
                    ...cell,
                    eliminatedCandidates: [value]
                  }))(cells)
                }
              );
              addStep(newStep);
            }
          }
        });
      } else if (blockType !== "box" && strategy === BOX_LINE_REDUCTION) {
        // Test box line reduction
        const gbi = getBoxIndex(size);
        const boxIndices = uniq(R.map(gbi)(candidates));
        const sameBox = boxIndices.length === 1;
        if (sameBox) {
          const box = getBox(size)(board)(boxIndices[0]);
          const cells = getCellsWithCandidates([value], box).filter(cell => {
            for (let i = 0; i < candidates.length; ++i) {
              if (candidates[i].x === cell.x && candidates[i].y === cell.y) {
                return false;
              }
            }
            return true;
          });
          if (cells.length) {
            const newStep = step(BOX_LINE_REDUCTION, {
              tuple: [value],
              cause: candidates,
              eliminations: R.map(cell => ({
                ...cell,
                eliminatedCandidates: [value]
              }))(cells)
            });
            addStep(newStep);
          }
        }
      }
    }
  });
};

export default intersectionRemoval;
