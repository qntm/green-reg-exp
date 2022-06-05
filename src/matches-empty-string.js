import * as constructors from './constructors.js'

export const matchesEmptyString = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand
  ) {
    return thing.matchesEmptyString()
  }

  return {
    mult: ({ multiplicand, multiplier }) =>
      matchesEmptyString(multiplicand) || multiplier.lower === 0,

    term: ({ inner }) =>
      matchesEmptyString(inner),

    conc: ({ terms }) =>
      terms.every(matchesEmptyString),

    pattern: ({ concs }) =>
      concs.some(matchesEmptyString)
  }[thing.type](thing)
}
