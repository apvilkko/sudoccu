import reducer from "./reducer";

const createDispatch = stateContainer => action => {
  stateContainer.state = reducer(stateContainer.state, action);
  // console.log("state after dispatch", stateContainer.state);
};

export default () => {
  const stateContainer = { state: reducer() };
  return {
    dispatch: createDispatch(stateContainer),
    getState: () => stateContainer.state
  };
};
