import { solvesSame } from './steps'

describe('solvesSame', () => {
  it('works, single', () => {
    const step1 = {
      type: '',
      tuple: [1],
      items: [{ coords: [0, 2] }],
    }
    expect(solvesSame(step1, { ...step1 })).toEqual(true)
    expect(solvesSame(step1, { ...step1, tuple: [2] })).toEqual(false)
    expect(
      solvesSame(step1, { ...step1, items: [{ coords: [1, 2] }] })
    ).toEqual(false)

    expect(
      solvesSame(
        {
          type: 'nakedSingle',
          tuple: [9],
          items: [
            {
              realIndex: 2,
              coords: [2, 0],
            },
          ],
        },
        {
          type: 'hiddenSingle',
          tuple: [9],
          groupIndex: 0,
          groupType: 0,
          items: [
            {
              index: 2,
              realIndex: 2,
              coords: [2, 0],
            },
          ],
        }
      )
    ).toEqual(true)
  })

  it('works, pair', () => {
    const step1 = {
      tuple: [1, 2],
      items: [{ coords: [0, 2] }, { coords: [0, 3] }],
    }
    expect(
      solvesSame(step1, {
        tuple: [2, 1],
        items: [{ coords: [0, 3] }, { coords: [0, 2] }],
      })
    ).toEqual(true)
  })
})
