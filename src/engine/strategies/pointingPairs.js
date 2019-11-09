import * as R from "ramda";
import {
  getRow,
  getCol,
  iterateBlocks,
  getCellsWithCandidates,
  getCellsInBlockByCandidateValue
} from "../../board/actions/board";
import { step, POINTING_PAIR } from "./common";
import { uniq } from "../math";

const pointingPairs = (board, size) => addStep => {
  iterateBlocks(size)(board)((block, blockType) => {
    if (blockType !== "block") {
      return;
    }
    for (let i = 0; i < size; ++i) {
      const value = i + 1;
      const candidates = getCellsInBlockByCandidateValue(value, 2, block, 2);
      const directions = [["y", "x", getRow], ["x", "y", getCol]];

      directions.forEach(([sameProp, existProp, getter]) => {
        const isSame = uniq(R.map(R.prop(sameProp))(candidates)).length === 1;

        if (isSame) {
          const candidateBlock = getter(size)(board)(candidates[0][sameProp]);
          const existing = R.map(R.prop(existProp))(candidates);
          const cells = getCellsWithCandidates([value], candidateBlock).filter(
            cell => !existing.includes(cell[existProp])
          );
          if (cells.length > 0) {
            const newStep = step(POINTING_PAIR, {
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
      });
    }
  });
};

export default pointingPairs;
