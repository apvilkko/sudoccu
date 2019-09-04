import { CLEAR, SET_ROW, SET_RANDOM_UNSOLVED } from "./actions/constants";
import {
  isFilled,
  getSize,
  getIntersectValuesAt,
  isValid,
  getRow
} from "./selectors";
import { getRandomWithout, randomBlock } from "../engine/math";
import { values } from "../engine/utils";
import { solve, getDifficulty } from "../engine/solver";

const sleep = timeout => {
  const promise = new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
  return promise.then(() => {});
};

const doRandomize = async store => {
  let y = 0;
  let tries = 0;
  let state = store.getState();
  const size = getSize(state);
  while (y < size) {
    let block;
    if (y > size / 2) {
      const partial = [];
      for (let x = 0; x < size; ++x) {
        const existing = getIntersectValuesAt(state)(x, y);
        partial.push(getRandomWithout(size)(existing.concat(partial)));
      }
      block = partial;
    } else {
      block = randomBlock(size);
    }
    store.dispatch({
      type: SET_ROW,
      payload: { y, row: block, setSolved: true }
    });
    state = store.getState();
    if (isValid(state)()) {
      // console.log(`${y} is ok, move on to ${y + 1}`, values(getRow(state)(y)));
      y++;
      tries = 0;
    } else {
      tries++;
      if (tries > 5000) {
        await sleep(5);
        tries = 0;
      }
    }
  }
};

const randomize = async store => {
  store.dispatch({ type: CLEAR });
  while (true) {
    await doRandomize(store);
    if (isFilled(store.getState())()) {
      break;
    }
    store.dispatch({ type: CLEAR });
    await sleep(5);
  }
};

const randomizePuzzle = async (store, difficulty = 0) => {
  await randomize(store);
  let puzzleDifficulty = 0;
  let steps = null;
  while (true) {
    store.dispatch({ type: SET_RANDOM_UNSOLVED });
    steps = solve(store.getState());
    puzzleDifficulty = getDifficulty(steps);
    console.log("puzzleDifficulty", puzzleDifficulty);
    const difficultEnough = puzzleDifficulty >= difficulty;
    if (difficultEnough) {
      break;
    }
  }
  return { difficulty: puzzleDifficulty, steps };
};

export { randomizePuzzle };
