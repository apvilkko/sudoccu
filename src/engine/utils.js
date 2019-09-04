const values = arr =>
  arr
    .map(x => (x ? x.value : undefined))
    .filter(x => x !== null && typeof x !== "undefined");

export { values };
