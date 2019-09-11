const getBoard = state => state.board;

const getSize = state => state.dim * state.dim;
const getDim = state => state.dim;

const getIndexFromSize = size => (x, y) => y * size + x;

const getIndex = state => (x, y) => getIndexFromSize(getSize(state))(x, y);

const getHighlight = state => state.highlight;

export { getBoard, getSize, getDim, getIndex, getIndexFromSize, getHighlight };
