import { multiply, star, concatenate, epsilon, union } from 'green-fsm'

import * as constructors from './constructors.js'

export const fsmify = (thing, alphabet) => {
  if (thing instanceof constructors.Charclass) {
    return thing.fsmify(alphabet)
  }

  return {
    multiplicand: ({ inner }, alphabet) =>
      fsmify(inner, alphabet),

    mult: ({ multiplicand, multiplier }, alphabet) => {
      // worked example: (min, max) = (5, 7) or (5, inf)
      // (mandatory, optional) = (5, 2) or (5, inf)

      const unit = fsmify(multiplicand, alphabet)
      // accepts e.g. "ab"

      // accepts "ababababab"
      const mandatory = multiply(unit, multiplier.lower)

      // unlimited additional copies
      const optional = multiplier.upper === Infinity
        ? star(unit)
        : multiply(union([epsilon(alphabet), unit]), multiplier.upper - multiplier.lower)

      return concatenate([mandatory, optional])
    },

    anchor: ({ end }, alphabet) => {
      throw Error('Cannot make an FSM out of an anchor.')
    },

    term: ({ inner }, alphabet) =>
      fsmify(inner, alphabet),

    conc: ({ terms }, alphabet) =>
      concatenate(terms.map(term => fsmify(term, alphabet))),

    pattern: ({ concs }, alphabet) =>
      union(concs.map(conc => fsmify(conc, alphabet)))
  }[thing.type](thing, alphabet)
}
