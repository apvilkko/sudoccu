const isSolved = cell => cell.solvedValue && cell.value === cell.solvedValue;

const hasCandidates = cell => amount => cell.candidates.length === amount;

export { isSolved, hasCandidates };
