import pointingPairs from "./pointingPairs";
import hiddenSets from "./hiddenSets";
import xWing from "./xWing";
import { NAKED, HIDDEN } from "./common";

// Following the order in http://www.sudokuwiki.org/Sudoku_Creation_and_Grading.pdf

export default [
  /* Naked/hidden tuples */
  hiddenSets(1, NAKED),
  hiddenSets(1, HIDDEN),
  hiddenSets(2, NAKED),
  hiddenSets(2, HIDDEN),
  hiddenSets(3, NAKED),
  hiddenSets(3, HIDDEN),
  // nakedQuads,
  // hiddenQuads,

  /* Intersection removal */
  pointingPairs,
  // pointing triples
  // Box/line reduction

  xWing

  // Simple colouring

  // Y-wing
  // Swordfish
  // X-Cycles
  // XY-Chain
  // 3D Medusa
  // Jellyfish

  // Avoidable rectangle
  // Unique Rectangles
  // Hidden Unique Rect's
  // Extended Unique Rect. ?

  // XYZ-wing
];

/*

BUG

WXYZ Wing
Aligned Pair Exclusion

Exocet
Grouped X-Cycles
Empty Rectangles
Finned X-Wing
Finned Swordfish
Altern. Inference Chains
Sue-de-Coq
Digit Forcing Chains
Nishio Forcing Chains
Cell Forcing Chains
Unit Forcing Chains
Almost Locked Sets
Death Blossom
Pattern Overlay Method
Quad Forcing Chains
*/
