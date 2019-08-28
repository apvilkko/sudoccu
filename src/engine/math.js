import MersenneTwister from "mersenne-twister";
const generator = new MersenneTwister();

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(generator.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

const randomBlock = size => {
  const line = Array.from({ length: size }).map((_, i) => i + 1);
  shuffle(line);
  return line;
};

const getListWithout = size => (omit, shouldShuffle) => {
  const choices = [];
  for (let i = 1; i < size + 1; ++i) {
    if (!omit.includes(i)) {
      choices.push(i);
    }
  }
  if (shouldShuffle) {
    shuffle(choices);
  }
  return choices;
};

const getRandomWithout = size => omit => getListWithout(size)(omit, true)[0];

const uniq = arr => {
  const values = {};
  for (let i = 0; i < arr.length; ++i) {
    values[arr[i]] = true;
  }
  return Object.keys(values).map(Number);
};

const isUnique = arr => uniq(arr).length === arr.length;

export {
  shuffle,
  getRandomWithout,
  randomBlock,
  isUnique,
  uniq,
  getListWithout
};
