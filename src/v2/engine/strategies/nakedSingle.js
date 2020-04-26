const nakedSingle = (board) => {
  const steps = []
  for (let i = 0; i < board.candidates.length; ++i) {
    if (board.candidates[i] && board.candidates[i].length === 1) {
      steps.push({
        type: 'nakedSingle',
        tuple: [board.candidates[i][0]],
        items: [{ realIndex: i }],
      })
    }
  }
  return steps
}

export default nakedSingle
