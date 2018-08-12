function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

const DIM = 9;

const randomLine = () => {
  const line = Array.from({length: DIM}).map((_, i) => i);
  shuffle(line);
  return line;
};

const getRandom = () => Math.floor(Math.random() * DIM + 1);
const getRandomWithout = omit => {
  const choices = [];
  for (let i = 1; i < (DIM + 1); ++i) {
    if (!omit.includes(i)) {
      choices.push(i);
    }
  }
  shuffle(choices);
  return choices[0];
};

class Cell {
  constructor(x, y) {
    this.type = 'default';
    this.x = x;
    this.y = y;
    this.value = null;
  }
}

class Board {
  constructor() {
    this.cells = [];
    for (let i = 0; i < (DIM * DIM); ++i) {
      const x = i % DIM;
      const y = Math.floor(i / DIM);
      this.cells.push(new Cell(x, y));
    }
  }

  at = (x, y) => {
    return this.cells[y * DIM + x];
  };

  set = (x, y, value) => {
    this.at(x, y).value = value;
  };

  map = mapper => {
    const out = [];
    for (let y = 0; y < DIM; ++y) {
      for (let x = 0; x < DIM; ++x) {
        out.push(mapper(this.at(x, y), x, y));
      }
    }
    return out;
  };

  clear = () => {
    for (let i = 0; i < (DIM * DIM); ++i) {
      this.cells[i].value = null;
    }
  };

  getIntersectValuesAt = (x, y) => {
    const values = [];
    for (let x1 = 0; x1 < DIM; ++x1) {
      if (x1 !== x && this.at(x1, y).value !== null) {
        values.push(this.at(x1, y).value);
      }
    }
    for (let y1 = 0; y1 < DIM; ++y1) {
      if (y1 !== y && this.at(x, y1).value !== null) {
        values.push(this.at(x, y1).value);
      }
    }
    const SUBDIM = 3;
    const sx = Math.floor(x / SUBDIM) * SUBDIM;
    const sy = Math.floor(y / SUBDIM) * SUBDIM;
    for (let y2 = sy; y2 < sy + SUBDIM; ++y2) {
      for (let x2 = sx; x2 < sx + SUBDIM; ++x2) {
        if (y2 !== y && x2 !== x && this.at(x2, y2).value !== null) {
          values.push(this.at(x2, y2).value);
        }
      }
    }
    return values;
  };

  doRandomize = () => {
    let failed = false;
    for (let y = 0; y < DIM; ++y) {
      for (let x = 0; x < DIM; ++x) {
        const intersectValues = this.getIntersectValuesAt(x, y);
        const rand = getRandomWithout(intersectValues);
        if (typeof rand === 'undefined') {
          failed = true;
          break;
        }
        this.set(x, y, rand);
      }
      if (failed) {
        break;
      }
    }
    if (failed && this.failCount < 500) {
      this.failCount++;
      this.doRandomize();
    }
  };

  randomize = () => {
    this.failCount = 0;
    this.doRandomize();
  };
}

export const initBoard = () => new Board();
