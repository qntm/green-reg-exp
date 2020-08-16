/* eslint-env jasmine */

'use strict'

const {anythingElse} = require('green-fsm')

const matchers = require('../src/matchers')
const fsmify = require('../src/fsmify')

describe('fsmify', function () {
  describe('charclass', function () {
    it('[^a]', function () {
      var nota = fsmify(matchers.charclass.parse1('[^a]'), [anythingElse, 'a'])

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
      var bcStar = matchers.mult.parse1('[bc]*')
      var int5A = fsmify(bcStar, ['a', 'b', 'c', anythingElse])
      expect(int5A.accepts([])).toBe(true)

      var c = matchers.mult.parse1('c')
      var int5B = fsmify(c, ['a', 'b', 'c', anythingElse])
      expect(int5B.accepts(['c'])).toBe(true)
    })
  })
})
