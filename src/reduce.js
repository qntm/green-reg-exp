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
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc
  ) {
    return thing.reduced()
  }

  return {
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

        const combinedCharclassConc = new constructors.Conc([
          new constructors.Term(
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
