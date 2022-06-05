import { union } from 'green-fsm'

import * as constructors from './constructors.js'

export const fsmify = (thing, alphabet) => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc
  ) {
    return thing.fsmify(alphabet)
  }

  return {
    pattern: ({ concs }, alphabet) =>
      union(concs.map(conc => fsmify(conc, alphabet)))
  }[thing.type](thing, alphabet)
}
