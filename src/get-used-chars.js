'use strict'

// Note that used characters are returned as an OBJECT whose KEYS
// are used characters.

const getUsedChars = thing => ({
  charclass: ({ chars }) =>
    Object.assign.apply(Object, [{}].concat(chars.map(chr => ({ [chr]: true })))),

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
})[thing.type](thing)

module.exports = getUsedChars
