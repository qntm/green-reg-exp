'use strict'

const {anythingElse, intersection} = require('green-fsm')
const monoParsers = require('./mono-parsers')
const usedCharGetters = require('./used-char-getters')
const fsmifiers = require('./fsmifiers')
const serialisers = require('./serialisers')
const constructors = require('./constructors')

const toFsm = pattern =>
  fsmifiers.pattern(pattern, Object.keys(usedCharGetters.pattern(pattern)).concat([anythingElse]))

const greenRegExp = {
  parse: string => {
    const pattern = monoParsers.pattern(string)
    let fsm
    return {
      pattern: pattern,
      toFsm: () => {
        if (!fsm) {
          fsm = toFsm(pattern)
        }
        return fsm
      },

      accepts: input => {
        if (!fsm) {
          fsm = toFsm(pattern)
        }
        return fsm.accepts(input.split(''))
      },

      strings: otherChar => {
        if (!fsm) {
          fsm = toFsm(pattern)
        }
        const iterator = fsm.strings()
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
  },

  intersection: (...strings) => {
    const patterns = strings.map(monoParsers.pattern)

    const charsUsed = Object.assign.apply(Object, [{}].concat(patterns.map(usedCharGetters.pattern)))

    const alphabet = Object.keys(charsUsed)

    const fsms = patterns.map(pattern => fsmifiers.pattern(pattern, alphabet.concat([anythingElse])))
    console.log(fsms[0].toString())
    console.log(fsms[1].toString())

    const f = intersection(fsms)
    console.log(f.toString())
    return

    // We need a new state not already used
    const outside = Symbol()

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
      Object.keys(f.map[current] || {}).forEach(symbol => {
        const next = f.map[current][symbol]
        if (states.indexOf(next) === -1) {
          states.push(next)
        }
      })
    }

    // Our system of equations is represented like so:
    const brz = {}
    f.states.forEach(a => {
      brz[a] = {}
      brz[a][outside] = '[]' // nothing
      f.states.forEach(b => {
        brz[a][b] = '[]' // nothing
      })
    })

    // Populate it with some initial data.
    Object.keys(f.map).forEach(a => {
      Object.keys(f.map[a]).forEach(symbol => {
        const b = f.map[a][symbol]
        if (symbol == anythingElse) {
          brz[a][b] = serialisers.charclass(constructors.charclass(alphabet, true))
        } else {
          brz[a][b] = serialisers.charclass(constructors.charclass([symbol], false))
        }
      })
      if (f.finals.indexOf(a) !== -1) {
        brz[a][outside] = '' // empty conc
      }
    })

    // Now perform our back-substitution
    for (let i = states.length - 1; i >= 0; i--) {
      const a = states[i]

      // Before the equation for R_a can be substituted into the other
      // equations, we need to resolve the self-transition (if any).
      // e.g.    R_a = 0 R_a |   1 R_b |   2 R_c
      // becomes R_a =         0*1 R_b | 0*2 R_c
      const loop = '(' + brz[a][a] + ')*'
      delete brz[a][a]

      Object.keys(brz[a]).forEach(right => {
        brz[a][right] = loop + '(' + brz[a][right] + ')'
      })

      // Note: even if we're down to our final equation, the above step still
      // needs to be performed before anything is returned.

      // Now we can substitute this equation into all of the previous ones.
      for (let j = 0; j < i; j++) {
        const b = states[j]

        // e.g. substituting R_a =  0*1 R_b |      0*2 R_c
        // into              R_b =    3 R_a |        4 R_c | 5 R_d
        // yields            R_b = 30*1 R_b | (30*2|4) R_c | 5 R_d
        const univ = brz[b][a] // i.e. "3"
        delete brz[b][a]

        Object.keys(brz[a]).forEach(right => {
          console.log(brz[b][right].length, univ.length, brz[a][right].length)
          brz[b][right] = '(' + brz[b][right] + ')(' + univ + ')(' + brz[a][right]
        })
      }
    }

    return brz[f.initial][outside]
  }
}

module.exports = greenRegExp
