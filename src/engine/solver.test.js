import { solve } from "./solver";
import Board from "./Board";

describe("solver", () => {
  describe("solve", () => {
    it("return 0 steps for solved puzzle", () => {
      const state = `629543817
158762493
734891625
876219534
412635789
395487261
241976358
583124976
967358142
`;
      const board = new Board(state);
      expect(solve(board)).toEqual([]);
      expect(board.at(0, 0).solvedValue !== null).toBeTruthy();
    });

    it("solves naked singles, simple case", () => {
      const state = `62.543817
158762493
734891625
8762195.4
412635789
395487261
241976.58
583124976
967358142
`;
      const steps = solve(new Board(state));
      const coords = steps.map(a => ({ x: a.cell.x, y: a.cell.y }));
      const types = steps.map(a => a.type);
      expect(types).toEqual(["nakedSingle", "nakedSingle", "nakedSingle"]);
      expect(coords.length).toEqual(3);
      expect(coords).toContainEqual({ x: 2, y: 0 });
      expect(coords).toContainEqual({ x: 7, y: 3 });
      expect(coords).toContainEqual({ x: 6, y: 6 });
    });

    it("solves naked singles, complex case", () => {
      const state = `1.4.9..68
956.18.34
..84.6951
51.....86
8..6...12
642.8..97
781923645
495.6.823
.6.854179
`;
      const board = new Board(state);
      const steps = solve(board);
      const coords = steps.map(a => ({ x: a.cell.x, y: a.cell.y }));
      const types = steps.map(a => a.type);
      expect(types).toContain("nakedSingle");
      expect(coords).toContainEqual({ x: 2, y: 8 });
      expect(board.at(2, 8).candidates).toEqual([3]);
    });
  });
});
