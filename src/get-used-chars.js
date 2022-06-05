import * as constructors from './constructors.js'

// Note that used characters are returned as an OBJECT whose KEYS
// are used characters.

export const getUsedChars = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term
  ) {
    return thing.getUsedChars()
  }

  return {
    conc: ({ terms }) =>
      Object.assign.apply(Object, [{}].concat(terms.map(getUsedChars))),

    pattern: ({ concs }) =>
      Object.assign.apply(Object, [{}].concat(concs.map(getUsedChars)))
  }[thing.type](thing)
}
