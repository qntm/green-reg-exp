'use strict'

const constructors = require('./constructors')
const arrayOps = require('./array-ops')
const equals = require('./equals')
const monoParsers = require('./mono-parsers')

// Here's the hard rule: a reducer MUST return the same type of object.
// E.g. a pattern reducer may NOT return a charclass. It must return
// a pattern. However, a multiplicand reducer MAY return a new multiplicand
// object whose inner object is a charclass, not a pattern.

const reduce = thing => ({
  // charclasses can't be reduced.
  charclass: charclass =>
    charclass,

  multiplicand: multiplicand => {
    // Empty pattern becomes /[]/ since the latter is serialisable
    if (equals(multiplicand.inner, constructors.pattern([]))) {
      return reduce(
        constructors.multiplicand(
          constructors.charclass([], false)
        )
      )
    }

    // e.g. /([ab])/ to /[ab]/
    if (
      multiplicand.inner.type === 'pattern' &&
      multiplicand.inner.concs.length === 1 &&
      multiplicand.inner.concs[0].mults.length === 1 &&
      equals(multiplicand.inner.concs[0].mults[0].multiplier, constructors.multiplier(1, 1))
    ) {
      return reduce(multiplicand.inner.concs[0].mults[0].multiplicand)
    }

    const shrunk = constructors.multiplicand(reduce(multiplicand.inner))
    if (!equals(shrunk, multiplicand)) {
      return reduce(shrunk)
    }

    return multiplicand
  },

  mult: mult => {
    const shrunk = constructors.mult(reduce(mult.multiplicand), mult.multiplier)
    if (!equals(shrunk, mult)) {
      return reduce(shrunk)
    }

    return mult
  },

  conc: conc => {
    // Strip out []*, []{0}, etc. from the listing
    // /abc[]*def/ becomes /abcdef/
    const killDeads = conc.mults.filter(mult =>
      !equals(mult.multiplicand, monoParsers.multiplicand('[]')) ||
      mult.multiplier.lower !== 0
    )
    if (killDeads.length < conc.mults.length) {
      return reduce(constructors.conc(killDeads))
    }

    // /abc[]def/ becomes /[]/
    if (conc.mults.length > 1 && conc.mults.some(mult => equals(mult, monoParsers.mult('[]')))) {
      return reduce(constructors.conc([monoParsers.mult('[]')]))
    }

    // /(((aby)))/ becomes /aby/
    if (
      conc.mults.length === 1 &&
      conc.mults[0].multiplicand.inner.type === 'pattern' &&
      conc.mults[0].multiplicand.inner.concs.length === 1 &&
      equals(conc.mults[0].multiplier, constructors.multiplier(1, 1))
    ) {
      return reduce(conc.mults[0].multiplicand.inner.concs[0])
    }

    // /a(d(ab|a*c))/ to /ad(ab|a*c)/
    // /ab(cd)ef/ to /abcdef/
    for (let i = 0; i < conc.mults.length; i++) {
      if (
        conc.mults[i].multiplicand.inner.type === 'pattern' &&
        conc.mults[i].multiplicand.inner.concs.length === 1 &&
        conc.mults[i].multiplier.lower === 1 &&
        conc.mults[i].multiplier.upper === 1
      ) {
        return reduce(constructors.conc(
          conc.mults.slice(0, i)
            .concat(conc.mults[i].multiplicand.inner.concs[0].mults)
            .concat(conc.mults.slice(i + 1))
        ))
      }
    }

    const shrunk = constructors.conc(conc.mults.map(reduce))
    if (!equals(shrunk, conc)) {
      return reduce(shrunk)
    }

    return conc
  },

  pattern: pattern => {
    // Unify charclasses e.g. /a|b|cde/ becomes /[ab]|cde/
    const charclassConcs = []
    const nonCharclassConcs = []
    pattern.concs.forEach(conc => {
      if (
        conc.mults.length === 1
        && conc.mults[0].multiplicand.inner.type === 'charclass'
        && conc.mults[0].multiplier.lower === 1
        && conc.mults[0].multiplier.upper === 1
      ) {
        charclassConcs.push(conc)
      } else {
        nonCharclassConcs.push(conc)
      }
    })

    if (charclassConcs.length >= 2) {
      const charclasses = charclassConcs.map(charclassConc =>
        charclassConc.mults[0].multiplicand.inner
      )

      const combinedCharclass = charclasses.reduce((acc, next) => {
        if (acc.negated) {
          if (next.negated) {
            return constructors.charclass(arrayOps.and(acc.chars, next.chars), true)
          } else {
            return constructors.charclass(arrayOps.minus(acc.chars, next.chars), true)
          }
        } else {
          if (next.negated) {
            return constructors.charclass(arrayOps.minus(next.chars, acc.chars), true)
          } else {
            return constructors.charclass(arrayOps.or(acc.chars, next.chars), false)
          }
        }
      }, constructors.charclass([], false))

      const combinedCharclassConc = constructors.conc([
        constructors.mult(
          constructors.multiplicand(
            combinedCharclass
          ),
          constructors.multiplier(1, 1)
        )
      ])

      return reduce(constructors.pattern([
        combinedCharclassConc,
        ...nonCharclassConcs
      ]))
    }

    // /[]|abc|def/ becomes /abc|def/
    const killDeads = pattern.concs.filter(conc =>
      !equals(conc, monoParsers.conc('[]'))
    )
    if (killDeads.length < pattern.concs.length) {
      return reduce(constructors.pattern(killDeads))
    }

    // /abc|abc/ becomes /abc/
    const removeDuplicates = pattern.concs.filter((conc, i) =>
      !pattern.concs.slice(0, i).some(otherConc => equals(conc, otherConc))
    )
    if (removeDuplicates.length < pattern.concs.length) {
      return reduce(constructors.pattern(removeDuplicates))
    }

    const shrunk = constructors.pattern(pattern.concs.map(reduce))
    if (!equals(shrunk, pattern)) {
      return reduce(shrunk)
    }
    return pattern
  }
})[thing.type](thing)

module.exports = reduce

/*
  conc
    (ab|cd|ef|)g to (ab|cd|ef)?g
    ab?b?c to ab{0,2}c
  pattern
    abc|ade to a(bc|de)
    xyz|stz to (xy|st)z
    a{1,2}|a{3,4} to a{1,4}
*/
