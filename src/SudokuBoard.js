import React from 'react'

const SudokuBoard = ({board}) => (
  <div className="board">
    {board.map((item, x, y) => (
      <div
        className={`cell ${y % 3 === 2 ? 'region-y' : ''} ${x % 3 === 2 ? 'region-x' : ''}`}
        key={`${x}${y}`}
      ><span className="value">{item.value}</span></div>
    ))}
  </div>
);

export default SudokuBoard
