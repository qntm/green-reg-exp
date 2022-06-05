import * as constructors from './constructors.js'
import { arrayOps } from './array-ops.js'
import { equals } from './equals.js'
import matchers from './matchers.js'

// Here's the hard rule: a reducer MUST return the same type of object.
// E.g. a pattern reducer may NOT return a charclass. It must return
// a pattern. However, a multiplicand reducer MAY return a new multiplicand
// object whose inner object is a charclass, not a pattern.

export const reduce = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult
  ) {
    return thing.reduced()
  }

  return {
    term: term => {
      const shrunk = constructors.term(reduce(term.inner))
      if (!equals(shrunk, term)) {
        return reduce(shrunk)
      }

      return term
    },

    conc: conc => {
      // First things first, ANCHORS.
      // /a?^/ becomes /^/
      // /a?^b?^/ becomes /^/

      // Strip out []*, []{0}, etc. from the listing
      // /abc[]*def/ becomes /abcdef/
      const killDeads = conc.terms.filter(term =>
        term.inner instanceof constructors.Mult && (
          !equals(term.inner.multiplicand, matchers.multiplicand.parse1('[]')) ||
          term.inner.multiplier.lower !== 0
        )
      )
      if (killDeads.length < conc.terms.length) {
        return reduce(constructors.conc(killDeads))
      }

      // /abc[]def/ becomes /[]/
      if (conc.terms.length > 1 && conc.terms.some(term => equals(term, matchers.term.parse1('[]')))) {
        return reduce(constructors.conc([matchers.term.parse1('[]')]))
      }

      // /(((aby)))/ becomes /aby/
      if (
        conc.terms.length === 1 &&
        conc.terms[0].inner instanceof constructors.Mult &&
        conc.terms[0].inner.multiplicand.inner.type === 'pattern' &&
        conc.terms[0].inner.multiplicand.inner.concs.length === 1 &&
        equals(conc.terms[0].inner.multiplier, new constructors.Multiplier(1, 1))
      ) {
        return reduce(conc.terms[0].inner.multiplicand.inner.concs[0])
      }

      // /a(d(ab|a*c))/ to /ad(ab|a*c)/
      // /ab(cd)ef/ to /abcdef/
      for (let i = 0; i < conc.terms.length; i++) {
        if (
          conc.terms[i].inner instanceof constructors.Mult &&
          conc.terms[i].inner.multiplicand.inner.type === 'pattern' &&
          conc.terms[i].inner.multiplicand.inner.concs.length === 1 &&
          conc.terms[i].inner.multiplier.lower === 1 &&
          conc.terms[i].inner.multiplier.upper === 1
        ) {
          return reduce(constructors.conc(
            conc.terms.slice(0, i)
              .concat(conc.terms[i].inner.multiplicand.inner.concs[0].terms)
              .concat(conc.terms.slice(i + 1))
          ))
        }
      }

      const shrunk = constructors.conc(conc.terms.map(reduce))
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
          conc.terms.length === 1 &&
          conc.terms[0].inner instanceof constructors.Mult &&
          conc.terms[0].inner.multiplicand.inner instanceof constructors.Charclass &&
          conc.terms[0].inner.multiplier.lower === 1 &&
          conc.terms[0].inner.multiplier.upper === 1
        ) {
          charclassConcs.push(conc)
        } else {
          nonCharclassConcs.push(conc)
        }
      })

      if (charclassConcs.length >= 2) {
        const charclasses = charclassConcs.map(charclassConc =>
          charclassConc.terms[0].inner.multiplicand.inner
        )

        const combinedCharclass = charclasses.reduce((acc, next) => {
          if (acc.negated) {
            if (next.negated) {
              return new constructors.Charclass(arrayOps.and(acc.chars, next.chars), true)
            } else {
              return new constructors.Charclass(arrayOps.minus(acc.chars, next.chars), true)
            }
          } else {
            if (next.negated) {
              return new constructors.Charclass(arrayOps.minus(next.chars, acc.chars), true)
            } else {
              return new constructors.Charclass(arrayOps.or(acc.chars, next.chars), false)
            }
          }
        }, new constructors.Charclass([], false))

        const combinedCharclassConc = constructors.conc([
          constructors.term(
            new constructors.Mult(
              new constructors.Multiplicand(
                combinedCharclass
              ),
              new constructors.Multiplier(1, 1)
            )
          )
        ])

        return reduce(constructors.pattern([
          combinedCharclassConc,
          ...nonCharclassConcs
        ]))
      }

      // /[]|abc|def/ becomes /abc|def/
      const killDeads = pattern.concs.filter(conc =>
        !equals(conc, matchers.conc.parse1('[]'))
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
  }[thing.type](thing)
}

/*
  conc
    (ab|cd|ef|)g to (ab|cd|ef)?g
    ab?b?c to ab{0,2}c
  pattern
    abc|ade to a(bc|de)
    xyz|stz to (xy|st)z
    a{1,2}|a{3,4} to a{1,4}
*/
