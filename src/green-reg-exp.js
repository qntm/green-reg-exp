import { anythingElse, intersection as fsmIntersection } from 'green-fsm'

import matchers from './matchers.js'
import { getUsedChars } from './get-used-chars.js'
import { fsmify } from './fsmify.js'
import { serialise } from './serialise.js'
import * as constructors from './constructors.js'
import { reduce as ourReduce } from './reduce.js'
import { deAnchorPattern } from './de-anchor.js'

export const parse = string => {
  const pattern = matchers.pattern.parse1(string)

  let fsm
  const toFsm = () => {
    if (!fsm) {
      fsm = fsmify(pattern, Object.keys(getUsedChars(pattern)).concat([anythingElse]))
    }
    return fsm
  }

  return {
    pattern,
    toFsm,

    accepts: input => {
      return toFsm().accepts(input.split(''))
    },

    strings: otherChar => {
      const iterator = toFsm().strings()
      return {
        next: () => {
          const result = iterator.next()
          if ('value' in result) {
            return {
              value: result.value.map(symbol => symbol === anythingElse ? otherChar : symbol).join(''),
              done: result.done
            }
          } else {
            return result
          }
        }
      }
    }
  }
}

export const intersection = (...strings) => {
  const patterns = strings.map(string => matchers.pattern.parse1(string))

  const charsUseds = patterns.map(getUsedChars)

  const charsUsed = Object.assign.apply(Object, [{}].concat(charsUseds))

  const alphabet = Object.keys(charsUsed)

  const fsms = patterns.map(pattern => fsmify(pattern, [...alphabet, anythingElse]))

  const f = fsmIntersection(fsms)

  // We need a new state not already used
  const outside = Symbol('outside')

  // The set of strings that would be accepted by this FSM if you started
  // at state i is represented by the regex R_i.
  // If state i has a sole transition "a" to state j, then we know R_i = a R_j.
  // If state i is final, then the empty string is also accepted by this regex.
  // And so on...

  // From this we can build a set of simultaneous equations in len(f.states)
  // variables. This system is easily solved for all variables, but we only
  // need one: R_a, where a is the starting state.

  // The first thing we need to do is organise the states into order of depth,
  // so that when we perform our back-substitutions, we can start with the
  // last (deepest) state and therefore finish with R_a.
  const states = [f.initial]
  for (let i = 0; i < states.length; i++) {
    const current = states[i]
    /* c8 ignore next */
    Object.keys(f.map[current] || {}).forEach(symbol => {
      const next = f.map[current][symbol]
      if (states.indexOf(next) === -1) {
        states.push(next)
      }
    })
  }

  // Our system of equations is represented like so:
  const brz = Object.assign.apply(Object, [{}].concat(f.states.map(a =>
    ({
      [a]: Object.assign.apply(Object, [{}].concat([...f.states, outside].map(b =>
        ({
          [b]: constructors.pattern([
            constructors.conc([
              constructors.term(
                new constructors.Mult(
                  new constructors.Multiplicand(
                    new constructors.Charclass([], false)
                  ),
                  new constructors.Multiplier(1, 1)
                )
              )
            ])
          ])
        })
      )))
    })
  )))
  // Note that every single thing in the system is a PATTERN.

  // Populate it with some initial data.
  Reflect.ownKeys(f.map).forEach(a => {
    Reflect.ownKeys(f.map[a]).forEach(symbol => {
      if (symbol in f.map[a]) {
        const b = f.map[a][symbol]
        brz[a][b] = ourReduce(constructors.pattern([
          ...brz[a][b].concs,
          constructors.conc([
            constructors.term(
              new constructors.Mult(
                new constructors.Multiplicand(
                  symbol === anythingElse
                    ? new constructors.Charclass(alphabet, true)
                    : new constructors.Charclass([symbol], false)
                ),
                new constructors.Multiplier(1, 1)
              )
            )
          ])
        ]))
      }
    })
    if (f.finals.includes(a)) {
      brz[a][outside] = ourReduce(constructors.pattern([
        ...brz[a][outside].concs,
        constructors.conc([])
      ]))
    }
  })

  // Now perform our back-substitution
  for (let i = states.length - 1; i >= 0; i--) {
    const a = states[i]

    // Before the equation for R_a can be substituted into the other
    // equations, we need to resolve the self-transition (if any).
    // e.g.    R_a = 0 R_a |   1 R_b |   2 R_c
    // becomes R_a =         0*1 R_b | 0*2 R_c
    const loopFactor = brz[a][a] // pattern
    delete brz[a][a]

    Reflect.ownKeys(brz[a]).forEach(right => {
      brz[a][right] = ourReduce(constructors.pattern([
        constructors.conc([
          constructors.term(
            new constructors.Mult(
              new constructors.Multiplicand(loopFactor),
              new constructors.Multiplier(0, Infinity)
            )
          ),
          constructors.term(
            new constructors.Mult(
              new constructors.Multiplicand(brz[a][right]),
              new constructors.Multiplier(1, 1)
            )
          )
        ])
      ]))
    })

    // Note: even if we're down to our final equation, the above step still
    // needs to be performed before anything is returned.

    // Now we can substitute this equation into all of the previous ones.
    for (let j = 0; j < i; j++) {
      const b = states[j]

      // e.g. substituting R_a =  0*1 R_b |      0*2 R_c
      // into              R_b =    3 R_a |        4 R_c | 5 R_d
      // yields            R_b = 30*1 R_b | (30*2|4) R_c | 5 R_d
      const univ = brz[b][a] // pattern, in this case "3"
      delete brz[b][a]

      Reflect.ownKeys(brz[a]).forEach(right => {
        brz[b][right] = ourReduce(constructors.pattern([
          ...brz[b][right].concs,
          constructors.conc([
            constructors.term(
              new constructors.Mult(
                new constructors.Multiplicand(univ),
                new constructors.Multiplier(1, 1)
              )
            ),
            constructors.term(
              new constructors.Mult(
                new constructors.Multiplicand(brz[a][right]),
                new constructors.Multiplier(1, 1)
              )
            )
          ])
        ]))
      })
    }
  }

  return serialise(brz[f.initial][outside])
}

export const reduce = string =>
  serialise(ourReduce(matchers.pattern.parse1(string)))

export const deAnchor = string =>
  serialise(deAnchorPattern(matchers.pattern.parse1(string)))
