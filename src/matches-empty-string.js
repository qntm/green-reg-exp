import * as constructors from './constructors.js'

export const matchesEmptyString = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult
  ) {
    return thing.matchesEmptyString()
  }

  return {
    term: ({ inner }) =>
      matchesEmptyString(inner),

    conc: ({ terms }) =>
      terms.every(matchesEmptyString),

    pattern: ({ concs }) =>
      concs.some(matchesEmptyString)
  }[thing.type](thing)
}
