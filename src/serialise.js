import * as constructors from './constructors.js'

export const serialise = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplier ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term
  ) {
    return thing.serialise()
  }

  return {
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
