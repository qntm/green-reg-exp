'use strict'

const constructors = require('./constructors')

const reducers = {
  charclass: charclass => charclass,

  mult: ({multiplicand, multiplier}) => {
  },

  multiplicand: ({inner}) => {
    // e.g. /([ab])/ to /[ab]/
    if (
      inner.type === 'pattern' &&
      inner.concs.length === 1 &&
      inner.concs[0].mults.length === 1
    ) {
      inner = inner.concs[0].mults[0].multiplicand.inner
    }

    return constructors.multiplicand(reducers[inner.type](inner))
  },

  conc: conc => conc,

  pattern: pattern => pattern
}

module.exports = reducers

/*
  conc
    (ab|cd|ef|)g to (ab|cd|ef)?g
    ab?b?c to ab{0,2}c
    a(d(ab|a*c)) to ad(ab|a*c)
    abc()def to abcdef
  pattern
    0|[2-9] to [02-9]
    abc|ade to a(bc|de)
    xyz|stz to (xy|st)z
    a{1,2}|a{3,4} to a{1,4}
*/
