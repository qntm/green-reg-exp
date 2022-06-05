import * as constructors from './constructors.js'

export const fsmify = (thing, alphabet) => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc ||
    thing instanceof constructors.Pattern
  ) {
    return thing.fsmify(alphabet)
  }

  return {
  }[thing.type](thing, alphabet)
}
