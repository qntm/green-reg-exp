/* eslint-env jasmine */

'use strict'

const matchers = require('../src/matchers.js')
const serialise = require('../src/serialise.js')

describe('serialise', function () {
  describe('charclass', function () {
    it('works for builtins', function () {
      expect(serialise(matchers.charclass.parse1('\\w'))).toBe('\\w')
      expect(serialise(matchers.charclass.parse1('\\W'))).toBe('\\W')
      expect(serialise(matchers.charclass.parse1('\\d'))).toBe('\\d')
      expect(serialise(matchers.charclass.parse1('\\D'))).toBe('\\D')
      expect(serialise(matchers.charclass.parse1('\\s'))).toBe('\\s')
      expect(serialise(matchers.charclass.parse1('\\S'))).toBe('\\S')
      expect(serialise(matchers.charclass.parse1('[]'))).toBe('[]')
      expect(serialise(matchers.charclass.parse1('.'))).toBe('.')
    })

    it('works', function () {
      expect(serialise(matchers.charclass.parse1('a'))).toBe('a')
      expect(serialise(matchers.charclass.parse1('\\{'))).toBe('\\{')
      expect(serialise(matchers.charclass.parse1('\\t'))).toBe('\\t')
      expect(serialise(matchers.charclass.parse1('[ab]'))).toBe('[ab]')
      expect(serialise(matchers.charclass.parse1('[a{]'))).toBe('[a{]')
      expect(serialise(matchers.charclass.parse1('[a\\t]'))).toBe('[\\ta]')
      expect(serialise(matchers.charclass.parse1('[a\\-]'))).toBe('[\\-a]')
      expect(serialise(matchers.charclass.parse1('[a\\[]'))).toBe('[\\[a]')
      expect(serialise(matchers.charclass.parse1('[a\\]]'))).toBe('[\\]a]')
      expect(serialise(matchers.charclass.parse1('[abc]'))).toBe('[abc]')
      expect(serialise(matchers.charclass.parse1('[abcd]'))).toBe('[a-d]')
      expect(serialise(matchers.charclass.parse1('[abcdfghi]'))).toBe('[a-df-i]')
      expect(serialise(matchers.charclass.parse1('\\^'))).toBe('\\^')
      expect(serialise(matchers.charclass.parse1('[\\^]'))).toBe('\\^')
      expect(serialise(matchers.charclass.parse1('\\\\'))).toBe('\\\\')
      expect(serialise(matchers.charclass.parse1('[\\\\]'))).toBe('\\\\')
      expect(serialise(matchers.charclass.parse1('[a\\^]'))).toBe('[\\^a]')
      expect(serialise(matchers.charclass.parse1('[0a123457896]'))).toBe('[0-9a]')
      expect(serialise(matchers.charclass.parse1('[\\t\\v\\r A]'))).toBe('[\\t\\v\\r A]')
      expect(serialise(matchers.charclass.parse1('[\\n\\f A]'))).toBe('[\\n\\f A]')
      expect(serialise(matchers.charclass.parse1('[\\t\\n\\v\\f\\r A]'))).toBe('[\\t-\\r A]')
      expect(serialise(matchers.charclass.parse1('.'))).toBe('.')
      expect(serialise(matchers.charclass.parse1('[^]'))).toBe('.')
      expect(serialise(matchers.charclass.parse1('[^a]'))).toBe('[^a]')
      expect(serialise(matchers.charclass.parse1('[^{]'))).toBe('[^{]')
      expect(serialise(matchers.charclass.parse1('[^\\t]'))).toBe('[^\\t]')
      expect(serialise(matchers.charclass.parse1('[^\\^]'))).toBe('[^\\^]')
    })

    it('works for a long range', function () {
      expect(serialise(matchers.charclass.parse1('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]'))).toBe('[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', function () {
      expect(serialise(matchers.charclass.parse1('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', function () {
      expect(serialise(matchers.charclass.parse1('\\t'))).toBe('\\t')
    })

    it('escapes control characters', function () {
      expect(serialise(matchers.charclass.parse1('\\u0000'))).toBe('\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', function () {
      expect(serialise(matchers.multiplier.parse1('{2,}'))).toBe('{2,}')
    })

    it('works on built-ins', function () {
      expect(serialise(matchers.multiplier.parse1('{0,1}'))).toBe('?')
      expect(serialise(matchers.multiplier.parse1('?'))).toBe('?')
      expect(serialise(matchers.multiplier.parse1('{1,1}'))).toBe('')
      expect(serialise(matchers.multiplier.parse1('{1}'))).toBe('')
      expect(serialise(matchers.multiplier.parse1(''))).toBe('')
      expect(serialise(matchers.multiplier.parse1('{0,}'))).toBe('*')
      expect(serialise(matchers.multiplier.parse1('*'))).toBe('*')
      expect(serialise(matchers.multiplier.parse1('{1,}'))).toBe('+')
      expect(serialise(matchers.multiplier.parse1('+'))).toBe('+')
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(serialise(matchers.mult.parse1('a{1,1}'))).toBe('a')
      expect(serialise(matchers.mult.parse1('a{1}'))).toBe('a')
      expect(serialise(matchers.mult.parse1('a'))).toBe('a')
      expect(serialise(matchers.mult.parse1('a{2,2}'))).toBe('a{2}')
      expect(serialise(matchers.mult.parse1('a{2}'))).toBe('a{2}')
      expect(serialise(matchers.mult.parse1('a{3,3}'))).toBe('a{3}')
      expect(serialise(matchers.mult.parse1('a{3}'))).toBe('a{3}')
      expect(serialise(matchers.mult.parse1('a{4,4}'))).toBe('a{4}')
      expect(serialise(matchers.mult.parse1('a{4}'))).toBe('a{4}')
      expect(serialise(matchers.mult.parse1('a{5,5}'))).toBe('a{5}')
      expect(serialise(matchers.mult.parse1('a{5}'))).toBe('a{5}')
      expect(serialise(matchers.mult.parse1('a{0,1}'))).toBe('a?')
      expect(serialise(matchers.mult.parse1('a?'))).toBe('a?')
      expect(serialise(matchers.mult.parse1('a{0,}'))).toBe('a*')
      expect(serialise(matchers.mult.parse1('a*'))).toBe('a*')
      expect(serialise(matchers.mult.parse1('a{1,}'))).toBe('a+')
      expect(serialise(matchers.mult.parse1('a+'))).toBe('a+')
      expect(serialise(matchers.mult.parse1('a{2,5}'))).toBe('a{2,5}')
      expect(serialise(matchers.mult.parse1('a{2,}'))).toBe('a{2,}')
    })

    it('works on built-in multiplicands', function () {
      expect(serialise(matchers.mult.parse1('[0-9]{1,1}'))).toBe('\\d')
      expect(serialise(matchers.mult.parse1('[0-9]{2,2}'))).toBe('\\d{2}')
      expect(serialise(matchers.mult.parse1('[0-9]{3,3}'))).toBe('\\d{3}')
    })
  })

  describe('pattern', function () {
    it('works', function () {
      expect(serialise(matchers.pattern.parse1('a|b'))).toBe('a|b')
      expect(serialise(matchers.pattern.parse1('a|a'))).toBe('a|a')
      expect(serialise(matchers.pattern.parse1('abc|def'))).toBe('abc|def')
      expect(serialise(matchers.pattern.parse1('()'))).toBe('()')
      expect(serialise(matchers.pattern.parse1('(ghi)'))).toBe('(ghi)')
      expect(serialise(matchers.pattern.parse1('(ghi|jkl)'))).toBe('(ghi|jkl)')
      expect(serialise(matchers.pattern.parse1('abc|def(ghi|jkl)'))).toBe('abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', function () {
      expect(serialise(matchers.pattern.parse1('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('round trips', function () {
      expect(serialise(matchers.pattern.parse1('a.b'))).toBe('a.b') // not "a[ab]b"
      expect(serialise(matchers.pattern.parse1('\\d{4}'))).toBe('\\d{4}')
      expect(serialise(matchers.pattern.parse1('a.b()()'))).toBe('a.b()()')
    })
  })
})
