import { iterateBlocks } from "../../board/actions/board";
import { filterCandidates, step, NAKED_SINGLE } from "./common";

const nakedSingles = (board, size) => addStep => {
  iterateBlocks(size)(board)(block => {
    const singleCandidates = filterCandidates(1)(block);
    Object.values(singleCandidates).forEach(candidate => {
      const newStep = step(NAKED_SINGLE, { solved: candidate });
      addStep(newStep);
    });
  });
};

export default nakedSingles;
