const values = arr =>
  arr.map(x => x.value).filter(x => x !== null && typeof x !== "undefined");

export { values };
