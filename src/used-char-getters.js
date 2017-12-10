'use strict'

// Note that used characters are returned as an OBJECT whose KEYS
// are used characters.

const usedCharGetters = {
  charclass: ({chars}) =>
    Object.assign.apply(Object, [{}].concat(chars.map(chr => ({[chr]: true})))),

  mult: ({multiplicand}) =>
    usedCharGetters[multiplicand.type](multiplicand),

  conc: ({mults}) =>
    Object.assign.apply(Object, [{}].concat(mults.map(usedCharGetters.mult))),

  pattern: ({concs}) =>
    Object.assign.apply(Object, [{}].concat(concs.map(usedCharGetters.conc)))
}

module.exports = usedCharGetters
