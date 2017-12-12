'use strict'

const constructors = require('./constructors')

// Here's the hard rule: a reducer MUST return the same type of object.
// E.g. a pattern reducer may NOT return a charclass. It must return
// a pattern. However, a multiplicand reducer MAY return a new multiplicand
// object whose inner object is a charclass, not a pattern.

const reducers = {
  // charclasses can't be reduced.
  charclass: charclass =>
    charclass,

  multiplicand: ({inner}) => {
    // e.g. /([ab])/ to /[ab]/
    if (
      inner.type === 'pattern' &&
      inner.concs.length === 1 &&
      inner.concs[0].mults.length === 1 &&
      inner.concs[0].mults[0].multiplier.lower === 1 &&
      inner.concs[0].mults[0].multiplier.upper === 1
    ) {
      return reducers.multiplicand(inner.concs[0].mults[0].multiplicand)
    }

    return constructors.multiplicand(reducers[inner.type](inner))
  },

  mult: ({multiplicand, multiplier}) =>
    constructors.mult(reducers.multiplicand(multiplicand), multiplier),

  conc: ({mults}) => {
    // abc()d()ef to abcdef
    const noEmptyMults = mults.filter(mult =>
      mult.multiplicand.inner.type === 'charclass' || (
        mult.multiplicand.inner.type === 'pattern' &&
        mult.multiplicand.inner.concs.length === 1 &&
        mult.multiplicand.inner.concs[0].mults.length !== 0
      )
    )
    if (noEmptyMults.length < mults.length) {
      return reducers.conc(constructors.conc(noEmptyMults))
    }

    // /a(d(ab|a*c))/ to /ad(ab|a*c)/
    // /ab(cd)ef/ to /abcdef/
    for (let i = 0; i < mults.length; i++) {
      if (
        mults[i].multiplicand.inner.type === 'pattern' &&
        mults[i].multiplicand.inner.concs.length === 1 &&
        mults[i].multiplier.lower === 1 &&
        mults[i].multiplier.upper === 1
      ) {
        return reducers.conc(constructors.conc(
          mults.slice(0, i)
            .concat(mults[i].multiplicand.inner.concs[0].mults)
            .concat(mults.slice(i + 1))
        ))
      }
    }

    return constructors.conc(mults.map(reducers.mult))
  },

  pattern: ({concs}) =>
    constructors.pattern(concs.map(reducers.conc))
}

module.exports = reducers

/*
  conc
    (ab|cd|ef|)g to (ab|cd|ef)?g
    ab?b?c to ab{0,2}c
  multiplicand
    0|[2-9] to [02-9]
  pattern
    abc|ade to a(bc|de)
    xyz|stz to (xy|st)z
    a{1,2}|a{3,4} to a{1,4}
*/
