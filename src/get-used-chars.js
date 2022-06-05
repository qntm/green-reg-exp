import * as constructors from './constructors.js'

// Note that used characters are returned as an OBJECT whose KEYS
// are used characters.

export const getUsedChars = thing => {
  if (thing instanceof constructors.Charclass) {
    return thing.getUsedChars()
  }

  return {
    multiplicand: ({ inner }) =>
      getUsedChars(inner),

    mult: ({ multiplicand }) =>
      getUsedChars(multiplicand),

    anchor: ({ end }) =>
      ({}),

    term: ({ inner }) =>
      getUsedChars(inner),

    conc: ({ terms }) =>
      Object.assign.apply(Object, [{}].concat(terms.map(getUsedChars))),

    pattern: ({ concs }) =>
      Object.assign.apply(Object, [{}].concat(concs.map(getUsedChars)))
  }[thing.type](thing)
}
