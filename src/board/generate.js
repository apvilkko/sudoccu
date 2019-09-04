import { SET_BOARD } from "./actions/constants";
import { getRandomWithout, randomBlock } from "../engine/math";
import { solve, getDifficulty } from "../engine/solver";
import { values } from "../engine/utils";
import {
  clear,
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
  let board = clear(size);
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
      console.log(`${y} is ok, move on to ${y + 1}`, rowValues);
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
    tries++;
  }
  console.log("randomize return", board);
  return board;
};

const randomizePuzzle = async (store, difficulty = 0) => {
  console.log("randomizePuzzle");
  const size = getSize(store.getState());
  let board = await randomize(size);
  if (!board) {
    throw new Error("unable to generate");
  }
  let puzzleDifficulty = 0;
  let steps = null;
  let tries = 0;
  let achievedDifficulty = 0;
  while (true) {
    console.log("set random unsolved");
    board = setRandomCellUnsolved(size)(board);
    console.log("solving", board);
    steps = solve(size)(board);
    puzzleDifficulty = getDifficulty(steps);
    if (puzzleDifficulty >= achievedDifficulty) {
      achievedDifficulty = puzzleDifficulty;
    }
    console.log("puzzleDifficulty", puzzleDifficulty);
    const difficultEnough = puzzleDifficulty >= difficulty;
    if (difficultEnough) {
      break;
    }
    if (achievedDifficulty > puzzleDifficulty) {
      throw new Error(
        "could only generate difficulty of " + achievedDifficulty
      );
    }
    tries++;
    if (tries > 5000) {
      throw new Error("unable to generate");
    }
  }
  store.dispatch({ type: SET_BOARD, payload: board });
  return { difficulty: puzzleDifficulty, steps };
};

export { randomizePuzzle };
