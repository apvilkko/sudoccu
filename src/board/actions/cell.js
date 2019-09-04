// ============================================================
// selectors
// ============================================================

const isSolved = cell => cell.solvedValue && cell.value === cell.solvedValue;

const hasCandidates = cell => amount => cell.candidates.length === amount;

// ============================================================
// actions
// ============================================================

const clearCell = item => ({
  ...item,
  value: null,
  candidates: [],
  solvedValue: null
});

const cellWithValue = oldCell => (value, setSolved) => {
  if (!oldCell) {
    throw new Error("oldCell can not be empty: " + value);
  }
  const cell = newCell(oldCell.x, oldCell.y);
  cell.value = value;
  if (setSolved) {
    cell.solvedValue = value;
  }
  return cell;
};

// ============================================================
// utils
// ============================================================

const newCell = (x, y) => {
  return { x, y };
};

export { isSolved, hasCandidates, newCell, clearCell, cellWithValue };
