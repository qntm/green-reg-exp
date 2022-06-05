import * as constructors from './constructors.js'

export const serialise = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplier ||
    thing instanceof constructors.Multiplicand
  ) {
    return thing.serialise()
  }

  return {
    anchor: ({ end }) =>
      end ? '$' : '^',

    mult: ({ multiplicand, multiplier }) =>
      serialise(multiplicand) + serialise(multiplier),

    term: ({ inner }) =>
      serialise(inner),

    conc: ({ terms }) =>
      terms.map(serialise).join(''),

    pattern: ({ concs }) => {
      if (concs.length === 0) {
        return '[]'
      }
      return concs.map(serialise).join('|')
    }
  }[thing.type](thing)
}
