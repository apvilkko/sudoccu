class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.clear();
  }

  clear() {
    this.value = null;
    this.candidates = [];
    this.solvedValue = null;
  }

  withValue(value, setSolved) {
    const newCell = new Cell(this.x, this.y);
    newCell.value = value;
    if (setSolved) {
      newCell.solvedValue = value;
    }
    return newCell;
  }

  isSolved() {
    return this.solvedValue && this.value === this.solvedValue;
  }

  setSolvedValue(value) {
    this.solvedValue = value;
  }

  setCandidates(candidates) {
    this.candidates = [...candidates];
  }

  hasCandidates(amount) {
    return this.candidates.length === amount;
  }
}

export default Cell;
