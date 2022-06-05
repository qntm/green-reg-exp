import * as constructors from './constructors.js'

export const serialise = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplier ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc ||
    thing instanceof constructors.Pattern
  ) {
    return thing.serialise()
  }

  return {
  }[thing.type](thing)
}
