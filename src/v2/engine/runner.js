import testcases from '../../testcases'
import solve from './solve'
import board from './board'

const data = testcases.TEST_NAKED_PAIRS
const { steps } = solve(board(data))
