import * as constructors from './constructors.js'

// Note that used characters are returned as an OBJECT whose KEYS
// are used characters.

export const getUsedChars = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc
  ) {
    return thing.getUsedChars()
  }

  return {
    pattern: ({ concs }) =>
      Object.assign.apply(Object, [{}].concat(concs.map(getUsedChars)))
  }[thing.type](thing)
}
