import React, { Component } from 'react';
import SudokuBoard from './SudokuBoard'
import {initBoard} from './logic';

import './App.css';

const Game = ({children}) => children;

class App extends Component {
  constructor(props) {
    super(props);
    const board = initBoard();
    board.randomize();
    this.state = {
      board
    };
  }

  render() {
    return (
      <div className="App">
        <Game>
          <SudokuBoard board={this.state.board} />
        </Game>
      </div>
    );
  }
}

export default App;
