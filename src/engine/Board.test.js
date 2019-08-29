import { values } from "./utils";
import { INIT, CLEAR, SET_ROW } from "../board/actions";
import { getRow } from "../board/selectors";
import reducer from "../board/reducer";

describe("Board", () => {
  describe("setRow", () => {
    it("works", () => {
      let state = reducer();
      state = reducer(state, { type: INIT });
      state = reducer(state, { type: CLEAR });
      const row = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      state = reducer(state, { type: SET_ROW, payload: { y: 0, row } });
      expect(values(getRow(state)(0))).toEqual(row);

      state = reducer(state, { type: CLEAR });
      state = reducer(state, { type: SET_ROW, payload: { y: 3, row } });
      expect(values(getRow(state)(3))).toEqual(row);

      state = reducer(state, { type: CLEAR });
      state = reducer(state, { type: SET_ROW, payload: { y: 8, row } });
      expect(values(getRow(state)(8))).toEqual(row);
    });
  });
});
