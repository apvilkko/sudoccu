import Cell from "./Cell";
import {
  randomBlock,
  isUnique,
  getRandomWithout,
  uniq,
  getListWithout
} from "./math";
import { values } from "./utils";

const sleep = timeout => {
  const promise = new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
  return promise.then(() => {});
};

class Board {
  constructor(state) {
    this.init();
    if (state) {
      this.initFromState(state);
    }
  }

  initFromState(state) {
    this.init();
    const rows = state.split("\n");
    rows.forEach((element, i) => {
      this.setRow(
        i,
        element.split("").map(x => {
          const number = Number(x);
          return isNaN(number) ? undefined : number;
        }),
        true
      );
    });
  }

  init() {
    this.dim = 3;
    this.size = this.dim * this.dim;
    this.cells = [];
    for (let i = 0; i < this.size * this.size; ++i) {
      const x = i % this.size;
      const y = Math.floor(i / this.size);
      this.cells.push(new Cell(x, y));
    }
  }

  at(x, y) {
    return this.cells[y * this.size + x];
  }

  set(x, y, value) {
    this.at(x, y).value = value;
  }

  setRow(y, row, setSolved) {
    this.cells = [
      ...this.cells.slice(0, y * this.size),
      ...row.map((value, x) => this.at(x, y).withValue(value, setSolved)),
      ...this.cells.slice((y + 1) * this.size)
    ];
  }

  row(y) {
    return this.cells.slice(y * this.size, y * this.size + this.size);
  }

  col(x) {
    const out = [];
    for (let y = 0; y < this.size; ++y) {
      out.push(this.at(x, y));
    }
    return out;
  }

  block(i) {
    const startY = Math.floor(i / this.dim) * this.dim;
    const startX = (i * this.dim) % this.size;
    const out = [];
    for (let y = startY; y < startY + this.dim; ++y) {
      for (let x = startX; x < startX + this.dim; ++x) {
        out.push(this.at(x, y));
      }
    }
    return out;
  }

  rows() {
    return Array.from({ length: this.size }).map((_, i) => {
      return this.row(i);
    });
  }

  map(mapper) {
    const out = [];
    for (let y = 0; y < this.size; ++y) {
      for (let x = 0; x < this.size; ++x) {
        out.push(mapper(this.at(x, y), x, y));
      }
    }
    return out;
  }

  clear() {
    for (let i = 0; i < this.size * this.size; ++i) {
      this.cells[i].value = null;
    }
  }

  getIntersectValuesAt(x, y) {
    const values = [];
    for (let x1 = 0; x1 < this.size; ++x1) {
      if (x1 !== x && this.at(x1, y).value !== null) {
        values.push(this.at(x1, y).value);
      }
    }
    for (let y1 = 0; y1 < this.size; ++y1) {
      if (y1 !== y && this.at(x, y1).value !== null) {
        values.push(this.at(x, y1).value);
      }
    }
    const sx = Math.floor(x / this.dim) * this.dim;
    const sy = Math.floor(y / this.dim) * this.dim;
    for (let y2 = sy; y2 < sy + this.dim; ++y2) {
      for (let x2 = sx; x2 < sx + this.dim; ++x2) {
        if (y2 !== y && x2 !== x && this.at(x2, y2).value !== null) {
          values.push(this.at(x2, y2).value);
        }
      }
    }
    return uniq(values);
  }

  isValid() {
    // Cols
    for (let x = 0; x < this.size; ++x) {
      if (!isUnique(values(this.col(x)))) {
        return false;
      }
    }

    // Rows
    for (let y = 0; y < this.size; ++y) {
      if (!isUnique(values(this.row(y)))) {
        return false;
      }
    }

    // Blocks
    for (let i = 0; i < this.size; ++i) {
      if (!isUnique(values(this.block(i)))) {
        return false;
      }
    }

    return true;
  }

  async doRandomize() {
    let y = 0;
    let tries = 0;
    while (y < this.size) {
      let block;
      if (y > this.size / 2) {
        const partial = [];
        for (let x = 0; x < this.size; ++x) {
          const existing = this.getIntersectValuesAt(x, y);
          partial.push(getRandomWithout(this.size)(existing.concat(partial)));
        }
        block = partial;
      } else {
        block = randomBlock(this.size);
      }
      this.setRow(y, block);
      if (this.isValid()) {
        // console.log(`${y} is ok, move on to ${y + 1}`, values(this.row(y)));
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
  }

  isFilled() {
    return this.cells.every(x => typeof x.value === "number");
  }

  isSolved() {
    return this.cells.every(x => x.solved);
  }

  async randomize() {
    this.clear();
    while (true) {
      await this.doRandomize();
      if (this.isFilled()) {
        break;
      }
      this.clear();
      await sleep(5);
    }
  }

  updateCandidates() {
    this.map((cell, x, y) => {
      const existing = this.getIntersectValuesAt(x, y);
      cell.setCandidates(getListWithout(this.size)(existing));
    });
  }
}

export default Board;
