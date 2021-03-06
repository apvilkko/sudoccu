//import * as R from "ramda";
import { solve /*applySteps*/ } from "./solver";
import { init, atBoard, updateCandidates } from "../board/actions/board";
import { newCell } from "../board/actions/cell";
import { filterCandidates, NAKED_SINGLE } from "./strategies/common";
import formatSteps from "../formatSteps";
import testcases from "../testcases";

const size = 9;

const blockOf = (data) => {
  return data.split(" ").map((spec, i) => {
    const cell = newCell(0, i);
    let value = spec;
    if (spec.startsWith("u")) {
      value = Number(value.substr(1));
      cell.solvedValue = value;
      cell.value = value;
    } else {
      cell.candidates = spec.split("").map(Number);
      if (cell.candidates.length === 1) {
        cell.value = cell.candidates[0];
      }
      cell.solvedCandidates = [...cell.candidates];
    }
    return cell;
  });
};

describe("solver", () => {
  describe("filterCandidates", () => {
    it("finds singles", () => {
      const block = blockOf("u4 6 1 125 12567 2567 u9 u3 u8");
      const candidates = filterCandidates(1)(block);
      const values = Object.values(candidates);
      expect(values.length).toEqual(2);
      const collected = [];
      values.forEach((value) => {
        expect(value.length).toEqual(1);
        collected.push(value[0].value);
      });
      expect(collected).toContain(1);
      expect(collected).toContain(6);
    });

    it("finds pairs", () => {
      const block = blockOf("u7 u6 2348 19 19 38 23 u5 23");
      const candidates = filterCandidates(2)(block);
      const values = Object.values(candidates);
      expect(values.length).toEqual(2);
      expect(values[0].length).toEqual(2);
      expect(values[1].length).toEqual(2);
    });
  });

  describe("updateCandidates", () => {
    it("sets the correct initial state", () => {
      const data = testcases.TEST_NAKED_SINGLES_AND_PAIRS;
      const board = init(size)(data);
      const result = updateCandidates(size)(board)();
      expect(atBoard(size)(result)(2, 0).candidates).toEqual([7]);
      expect(atBoard(size)(result)(2, 4).candidates).toEqual([2, 7]);
      expect(atBoard(size)(result)(0, 1).candidates).toEqual([9]);
      expect(atBoard(size)(result)(4, 5).candidates).toEqual([3, 6, 8]);
    });
  });

  describe("solve", () => {
    it("return 0 steps for solved puzzle", () => {
      const data = testcases.TEST_SOLVED;
      const board = init(size)(data);
      expect(solve(size)(board)).toEqual([]);
      expect(atBoard(size)(board)(0, 0).solvedValue !== null).toBeTruthy();
    });

    it("solves naked singles, simple case", () => {
      const data = testcases.TEST_SINGLES_SIMPLE;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const coords = steps.map((a) => ({ x: a.solved[0].x, y: a.solved[0].y }));
      const types = steps.map((a) => a.type);
      expect(types).toEqual(["nakedSingle", "nakedSingle", "nakedSingle"]);
      expect(coords.length).toEqual(3);
      expect(steps[0].solved[0].candidates).toEqual([9]);
      expect(coords).toContainEqual({ x: 2, y: 0 });
      expect(coords).toContainEqual({ x: 7, y: 3 });
      expect(coords).toContainEqual({ x: 6, y: 6 });
    });

    it("solves naked singles, complex case", () => {
      const data = testcases.TEST_SINGLES_COMPLEX;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const coords = steps
        .filter((a) => a.type === NAKED_SINGLE)
        .map((a) => ({ x: a.solved[0].x, y: a.solved[0].y }));
      const types = steps.map((a) => a.type);
      expect(types).toContain("nakedSingle");
      expect(coords).toContainEqual({ x: 2, y: 8 });
    });

    it("solves naked pairs", () => {
      const data = testcases.TEST_NAKED_PAIRS;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const matches = steps.filter((a) => a.type === "nakedPair");
      expect(matches.length > 0).toBeTruthy();

      expect(matches[0].tuple).toEqual([1, 2]);
      expect(matches[0].eliminations.length).toEqual(1);
      expect(matches[0].eliminations[0].x).toEqual(5);
      expect(matches[0].eliminations[0].y).toEqual(1);
      expect(matches[0].eliminations[0].eliminatedCandidates).toEqual([1, 2]);
      expect(matches[0].cause).toEqual([{ x: 5, y: 0 }, { x: 5, y: 6 }]);

      expect(matches[1].tuple).toEqual([4, 7]);
      expect(matches[1].eliminations.length).toEqual(2);
      expect(matches[1].eliminations[0].x).toEqual(2);
      expect(matches[1].eliminations[0].y).toEqual(7);
      expect(matches[1].eliminations[0].eliminatedCandidates).toEqual([7]);
      expect(matches[1].eliminations[1].x).toEqual(2);
      expect(matches[1].eliminations[1].y).toEqual(8);
      expect(matches[1].eliminations[1].eliminatedCandidates).toEqual([7]);
    });

    it("solves pointing pairs", () => {
      const data = testcases.TEST_POINTING_PAIRS;
      const board = init(size)(data);
      const steps = solve(size)(board, true);
      expect(steps.map((a) => a.type)).toContain("pointingPair");
    });

    it("solves hidden singles", () => {
      const data = testcases.TEST_HIDDEN_SINGLE;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const formattedSteps = formatSteps(steps);
      expect(formattedSteps).toContain("hiddenSingle: 6 at B8");
      expect(formattedSteps).toContain("hiddenSingle: 5 at G4");
      expect(formattedSteps).toContain("hiddenSingle: 5 at E5");
    });

    it("solves pointing triples", () => {
      const data = testcases.TEST_POINTING_TRIPLE;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const step = steps.filter((a) => a.type === "pointingTriple");
      expect(step.length).toBe(1);
      expect(step[0].eliminations.length).toBe(1);
      expect(step[0].eliminations[0]).toEqual({
        eliminatedCandidates: [3],
        x: 5,
        y: 4,
      });
    });

    it("solves box line reduction", () => {
      const data = testcases.TEST_BOX_LINE_REDUCTION;
      const board = init(size)(data);
      const steps = solve(size)(board, true);
      const step = steps.find(
        (a) =>
          a.type === "boxLineReduction" &&
          a.tuple[0] === 2 &&
          a.eliminations.length === 3
      );
      expect(!!step).toBeTruthy();
    });

    it("solves x-wing", () => {
      const data = testcases.TEST_X_WING;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const xwings = steps.filter((a) => a.type === "x-wing");
      expect(xwings.length > 0).toBeTruthy();
      expect(xwings[0].tuple).toEqual([7]);
    });

    it("solves x-wing, 2nd orientation", () => {
      const data = testcases.TEST_X_WING_2;
      const board = init(size)(data);
      const steps = solve(size)(board, true);
      const xwings = steps.filter((a) => a.type === "x-wing");
      expect(xwings.length > 0).toBeTruthy();
      expect(xwings[0].tuple).toEqual([2]);
    });

    it("solves hidden pairs", () => {
      const data = testcases.TEST_HIDDEN_PAIRS;
      const board = init(size)(data);
      const steps = solve(size)(board, true);
      const matches = steps.filter((a) => a.type === "hiddenPair");
      expect(matches.length > 0).toBeTruthy();

      expect(matches[0].tuple).toEqual([2, 4]);
      expect(matches[0].eliminations.length).toEqual(2);
      expect(matches[0].eliminations[0].x).toEqual(2);
      expect(matches[0].eliminations[0].y).toEqual(3);
      expect(matches[0].eliminations[0].eliminatedCandidates).toEqual([5, 6]);
      expect(matches[0].eliminations[1].x).toEqual(2);
      expect(matches[0].eliminations[1].y).toEqual(4);
      expect(matches[0].eliminations[1].eliminatedCandidates).toEqual([
        3,
        6,
        7,
      ]);
    });

    it("solves hidden triples", () => {
      const data = testcases.TEST_HIDDEN_TRIPLES;
      const board = init(size)(data);
      const steps = solve(size)(board);
      const matches = steps.filter((a) => a.type === "hiddenTriple");
      expect(matches.length > 0).toBeTruthy();
    });

    it("creates a solution that does not change during applying steps", () => {
      const data = testcases.TEST_NAKED_SINGLES_AND_PAIRS;
      const board = init(size)(data);
      const steps = solve(size)(board);
      //console.log(formatSteps(steps));
      let result = board;
      // TODO
      /*for (let i = 0; i < steps.length; ++i) {
        const step = steps[i];
        const remainingSteps = steps.slice(i + 1);
        result = applySteps(size)(result)([step]);
        const newSteps = solve(size)(result);
        for (let j = 0; j < remainingSteps.length; ++j) {
          const remStep = remainingSteps[j];
          if (!R.equals(remStep, newSteps[j])) {
            console.log(
              "No match at",
              i,
              j,
              "\n",
              formatSteps([remStep, newSteps[j]])
            );
          } else {
            console.log("matched", i, j, formatSteps([remStep]));
          }
        }
        expect(remainingSteps).toEqual(newSteps);
      }*/
    });
  });
});
