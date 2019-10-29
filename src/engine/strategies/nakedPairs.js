import * as R from "ramda";
import {
  iterateBlocks,
  getCellsWithCandidates
} from "../../board/actions/board";
import { getCandidates } from "../../board/actions/cell";
import { filterCandidates, step, NAKED_PAIR } from "./common";

const getTupleFromKey = key => {
  const match = key.match(/\[(\d+),(\d+)\]/);
  if (match) {
    return match.slice(1).map(Number);
  }
  return [];
};

const nakedPairs = (board, size) => addStep => {
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
        addStep(newStep);
      }
    });
  });
};

export default nakedPairs;
