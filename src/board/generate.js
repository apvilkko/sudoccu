import * as R from "ramda";
import { SET_BOARD } from "./actions/constants";
import { getRandomWithout, randomBlock } from "../engine/math";
import { solve, getDifficulty } from "../engine/solver";
import { values } from "../engine/utils";
import {
  init,
  getIntersectValuesAtBoard,
  setRow,
  getRow,
  isFilled,
  isValid,
  setRandomCellUnsolved
} from "./actions/board";
import { getSize } from "./selectors";

const sleep = timeout => {
  const promise = new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
  return promise.then(() => {});
};

const doRandomize = size => {
  console.log("doRandomize", size);
  let y = 0;
  let tries = 0;
  let board = init(size)();
  while (y < size) {
    let block;
    if (y > size / 2) {
      const partial = [];
      for (let x = 0; x < size; ++x) {
        const existing = getIntersectValuesAtBoard(size)(board)(x, y);
        partial.push(getRandomWithout(size)(existing.concat(partial)));
      }
      block = partial;
    } else {
      block = randomBlock(size);
    }
    board = setRow(size)(board)({ y, row: block, setSolved: true });
    const rowValues = values(getRow(size)(board)(y));
    if (rowValues.length === size && isValid(size)(board)()) {
      //console.log(`${y} is ok, move on to ${y + 1}`, rowValues);
      y++;
      tries = 0;
    } else {
      tries++;
      if (tries > 5000) {
        throw new Error("bailout");
      }
    }
  }
  return board;
};

const randomize = async size => {
  console.log("randomize");
  let tries = 0;
  let board;
  while (tries < 5000) {
    try {
      board = doRandomize(size);
    } catch (err) {
      console.log(err);
    }
    if (isFilled(board)) {
      break;
    }
    await sleep(5);
    console.log("randomize fail");
    tries++;
  }
  console.log("randomize return", board);
  return board;
};

const randomizePuzzle = async (store, difficulty = 0) => {
  console.log("randomizePuzzle");
  const size = getSize(store.getState());
  const boards = {};
  boards.current = await randomize(size);
  if (!boards.current) {
    throw new Error("unable to generate");
  }
  boards.original = R.clone(boards.current);

  let puzzleDifficulty;
  let steps = null;
  let tries = 0;
  let achievedDifficulty;
  let triesWithSameBoard = 0;
  let initialStep = true;
  let initialStepSize = 30;
  let goodCandidate = null;
  let goodCandidateCounter = 0;

  const reset = () => {
    puzzleDifficulty = 0;
    achievedDifficulty = 0;
    initialStep = true;
  };

  const retryWithSame = async part => {
    triesWithSameBoard++;
    if (triesWithSameBoard % 5) {
      await sleep(1);
    }
    if (triesWithSameBoard > 16) {
      throw new Error("bailout with same board");
    }
    if (goodCandidate && goodCandidateCounter < 100) {
      console.log(part, "... retry with >1 candidate");
      boards.current = R.clone(goodCandidate);
      goodCandidateCounter++;
    } else {
      console.log(part, "... retry with same");
      boards.current = R.clone(boards.original);
      goodCandidate = null;
      goodCandidateCounter = 0;
    }
    reset();
  };

  reset();

  while (true) {
    //console.log("set random unsolved");
    if (initialStep) {
      for (let i = 0; i < initialStepSize; ++i) {
        boards.current = setRandomCellUnsolved(size)(boards.current);
      }
      initialStep = false;
    } else {
      boards.current = setRandomCellUnsolved(size)(boards.current);
    }

    try {
      steps = solve(size)(boards.current);
    } catch (err) {
      await retryWithSame(1);
      continue;
    }

    const diff = getDifficulty(steps);
    puzzleDifficulty = diff[0];
    if (diff[1]) {
      console.log(diff);
      goodCandidate = R.clone(boards.current);
    }
    if (puzzleDifficulty >= achievedDifficulty) {
      achievedDifficulty = puzzleDifficulty;
    }
    const difficultEnough = puzzleDifficulty >= difficulty;
    if (difficultEnough) {
      console.log("... achieved difficulty");
      break;
    }
    if (achievedDifficulty > puzzleDifficulty) {
      await retryWithSame(2);
      continue;

      //console.log("... randomizePuzzle throw");
      /* throw new Error(
        "could only generate difficulty of " + achievedDifficulty
      ); */
    }
    tries++;
    if (tries > 5000) {
      console.log("... randomizePuzzle unable");
      throw new Error("unable to generate");
    }
  }
  // initializeCandidates(size)(board);
  store.dispatch({ type: SET_BOARD, payload: boards.current });
  console.log("puzzle difficulty is", puzzleDifficulty);
  return { difficulty: puzzleDifficulty, steps };
};

export { randomizePuzzle };
