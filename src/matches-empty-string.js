'use strict'

const matchesEmptyString = thing => ({
  charclass: () => false,

  multiplicand: ({inner}) =>
    matchesEmptyString(inner),

  mult: ({multiplicand, multiplier}) =>
    matchesEmptyString(multiplicand) || multiplier.lower === 0,

  term: ({inner}) =>
    matchesEmptyString(inner),

  conc: ({terms}) =>
    terms.every(matchesEmptyString),

  pattern: ({concs}) =>
    concs.any(matchesEmptyString)
})[thing.type](thing)

module.exports = matchesEmptyString
