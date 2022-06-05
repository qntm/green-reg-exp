import { concatenate, union } from 'green-fsm'

import * as constructors from './constructors.js'

export const fsmify = (thing, alphabet) => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Anchor
  ) {
    return thing.fsmify(alphabet)
  }

  return {
    term: ({ inner }, alphabet) =>
      fsmify(inner, alphabet),

    conc: ({ terms }, alphabet) =>
      concatenate(terms.map(term => fsmify(term, alphabet))),

    pattern: ({ concs }, alphabet) =>
      union(concs.map(conc => fsmify(conc, alphabet)))
  }[thing.type](thing, alphabet)
}
