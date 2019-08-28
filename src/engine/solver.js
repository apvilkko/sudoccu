import { values } from "./utils";

const unsolved = block => block.filter(x => !x.isSolved());

const NAKED_SINGLE = "nakedSingle";

const step = (type, cell) => ({
  type,
  cell
});

const blockCheck = (board, handler) => {
  for (let i = 0; i < board.size; ++i) {
    handler(board.row(i));
    handler(board.col(i));
    handler(board.block(i));
  }
};

const isEqualStep = (one, other) => {
  return (
    one.type === other.type &&
    one.cell.x === other.cell.x &&
    one.cell.y === other.cell.y
  );
};

const addStep = (steps, step) => {
  for (let i = 0; i < steps.length; ++i) {
    if (isEqualStep(step, steps[i])) {
      return;
    }
  }
  steps.push(step);
};

const solve = board => {
  const steps = [];

  // Check validity first
  if (!board.isValid()) {
    throw new Error("invalid board state");
  }

  // If board is already solved, no need to do anything.
  if (!board.isSolved()) {
    // Find naked singles
    blockCheck(board, block => {
      const remaining = unsolved(block);
      if (remaining.length === 1) {
        addStep(steps, step(NAKED_SINGLE, remaining[0]));
      }
    });
  }

  return steps;
};

export { solve };
