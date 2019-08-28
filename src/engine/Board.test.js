import Board from "./Board";
import { values } from "./utils";

describe("Board", () => {
  describe("setRow", () => {
    it("works", () => {
      const board = new Board();
      board.clear();
      const row = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      board.setRow(0, row);
      expect(values(board.row(0))).toEqual(row);

      board.clear();
      board.setRow(3, row);
      expect(values(board.row(3))).toEqual(row);

      board.clear();
      board.setRow(8, row);
      expect(values(board.row(8))).toEqual(row);
    });
  });
});
