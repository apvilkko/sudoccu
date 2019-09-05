const values = arr =>
  arr
    .map(x => (x ? x.value : undefined))
    .filter(x => x !== null && typeof x !== "undefined");

const sort = arr => Array.prototype.slice.call(arr).sort();

export { values, sort };
