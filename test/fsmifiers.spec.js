/* eslint-env jasmine */

'use strict'

const {anythingElse} = require('green-fsm')

const monoParsers = require('../src/mono-parsers.js')
const fsmifiers = require('../src/fsmifiers.js')

describe('fsmifiers', function () {
  describe('charclass', function () {
    it('[^a]', function () {
      var nota = fsmifiers.charclass(monoParsers.charclass('[^a]'), [anythingElse, 'a'])

      expect(nota.accepts([])).toBe(false)
      expect(nota.accepts(['a'])).toBe(false)
      expect(nota.accepts(['b'])).toBe(true)
      expect(nota.accepts([anythingElse])).toBe(true)
      expect(nota.accepts(['c'])).toBe(true)
      expect(nota.accepts([{}])).toBe(true)
      expect(nota.accepts([4358375923])).toBe(true)
      expect(nota.accepts(['b', 'b'])).toBe(false)
    })
  })

  describe('mult', function () {
    // Odd bug with ([bc]*c)?[ab]*
    it('odd bug', function () {
      var bcStar = monoParsers.mult('[bc]*')
      var int5A = fsmifiers.mult(bcStar, ['a', 'b', 'c', anythingElse])
      expect(int5A.accepts([])).toBe(true)

      var c = monoParsers.mult('c')
      var int5B = fsmifiers.mult(c, ['a', 'b', 'c', anythingElse])
      expect(int5B.accepts(['c'])).toBe(true)
    })
  })
})
