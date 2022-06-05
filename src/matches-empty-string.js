import * as constructors from './constructors.js'

export const matchesEmptyString = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Term
  ) {
    return thing.matchesEmptyString()
  }

  return {
    conc: ({ terms }) =>
      terms.every(matchesEmptyString),

    pattern: ({ concs }) =>
      concs.some(matchesEmptyString)
  }[thing.type](thing)
}
