'use strict'

const {fsm, multiply, star, concatenate, epsilon, union} = require('green-fsm')

const fsmify = (thing, alphabet) => ({
  charclass: ({chars, negated}, alphabet) => {
    // "0" is initial, "1" is final
    const map = {
      '0': {}
    }

    // If normal, make a singular FSM accepting only these characters
    // If negated, make a singular FSM accepting any other characters
    alphabet
      .filter(chr => chars.includes(chr) !== negated)
      .forEach(chr => {
        map['0'][chr] = '1'
      })

    return fsm(alphabet, ['0', '1'], '0', ['1'], map)
  },

  multiplicand: ({inner}, alphabet) =>
    fsmify(inner, alphabet),

  mult: ({multiplicand, multiplier}, alphabet) => {
    // worked example: (min, max) = (5, 7) or (5, inf)
    // (mandatory, optional) = (5, 2) or (5, inf)

    var unit = fsmify(multiplicand, alphabet)
    // accepts e.g. "ab"

    // accepts "ababababab"
    var mandatory = multiply(unit, multiplier.lower)

    // unlimited additional copies
    var optional = multiplier.upper === Infinity
      ? star(unit)
      : multiply(union([epsilon(alphabet), unit]), multiplier.upper - multiplier.lower)

    return concatenate([mandatory, optional])
  },

  conc: ({mults}, alphabet) =>
    concatenate(mults.map(mult => fsmify(mult, alphabet))),

  pattern: ({concs}, alphabet) =>
    union(concs.map(conc => fsmify(conc, alphabet)))
})[thing.type](thing, alphabet)

module.exports = fsmify
