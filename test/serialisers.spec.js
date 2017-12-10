/* eslint-env jasmine */

'use strict'

const monoParsers = require('../src/mono-parsers.js')
const serialisers = require('../src/serialisers.js')

describe('serialisers', function () {
  describe('charclass', function () {
    it('works for builtins', function () {
      expect(serialisers.charclass(monoParsers.charclass('\\w'))).toBe('\\w')
      expect(serialisers.charclass(monoParsers.charclass('\\W'))).toBe('\\W')
      expect(serialisers.charclass(monoParsers.charclass('\\d'))).toBe('\\d')
      expect(serialisers.charclass(monoParsers.charclass('\\D'))).toBe('\\D')
      expect(serialisers.charclass(monoParsers.charclass('\\s'))).toBe('\\s')
      expect(serialisers.charclass(monoParsers.charclass('\\S'))).toBe('\\S')
      expect(serialisers.charclass(monoParsers.charclass('[]'))).toBe('[]')
      expect(serialisers.charclass(monoParsers.charclass('.'))).toBe('.')
    })

    it('works', function () {
      expect(serialisers.charclass(monoParsers.charclass('a'))).toBe('a')
      expect(serialisers.charclass(monoParsers.charclass('\\{'))).toBe('\\{')
      expect(serialisers.charclass(monoParsers.charclass('\\t'))).toBe('\\t')
      expect(serialisers.charclass(monoParsers.charclass('[ab]'))).toBe('[ab]')
      expect(serialisers.charclass(monoParsers.charclass('[a{]'))).toBe('[a{]')
      expect(serialisers.charclass(monoParsers.charclass('[a\\t]'))).toBe('[\\ta]')
      expect(serialisers.charclass(monoParsers.charclass('[a\\-]'))).toBe('[\\-a]')
      expect(serialisers.charclass(monoParsers.charclass('[a\\[]'))).toBe('[\\[a]')
      expect(serialisers.charclass(monoParsers.charclass('[a\\]]'))).toBe('[\\]a]')
      expect(serialisers.charclass(monoParsers.charclass('[abc]'))).toBe('[abc]')
      expect(serialisers.charclass(monoParsers.charclass('[abcd]'))).toBe('[a-d]')
      expect(serialisers.charclass(monoParsers.charclass('[abcdfghi]'))).toBe('[a-df-i]')
      expect(serialisers.charclass(monoParsers.charclass('^'))).toBe('^')
      expect(serialisers.charclass(monoParsers.charclass('[\\^]'))).toBe('^')
      expect(serialisers.charclass(monoParsers.charclass('\\\\'))).toBe('\\\\')
      expect(serialisers.charclass(monoParsers.charclass('[\\\\]'))).toBe('\\\\')
      expect(serialisers.charclass(monoParsers.charclass('[a\\^]'))).toBe('[\\^a]')
      expect(serialisers.charclass(monoParsers.charclass('[0a123457896]'))).toBe('[0-9a]')
      expect(serialisers.charclass(monoParsers.charclass('[\\t\\v\\r A]'))).toBe('[\\t\\v\\r A]')
      expect(serialisers.charclass(monoParsers.charclass('[\\n\\f A]'))).toBe('[\\n\\f A]')
      expect(serialisers.charclass(monoParsers.charclass('[\\t\\n\\v\\f\\r A]'))).toBe('[\\t-\\r A]')
      expect(serialisers.charclass(monoParsers.charclass('.'))).toBe('.')
      expect(serialisers.charclass(monoParsers.charclass('[^]'))).toBe('.')
      expect(serialisers.charclass(monoParsers.charclass('[^a]'))).toBe('[^a]')
      expect(serialisers.charclass(monoParsers.charclass('[^{]'))).toBe('[^{]')
      expect(serialisers.charclass(monoParsers.charclass('[^\\t]'))).toBe('[^\\t]')
      expect(serialisers.charclass(monoParsers.charclass('[^\\^]'))).toBe('[^\\^]')
    })

    it('works for a long range', function () {
      expect(serialisers.charclass(monoParsers.charclass('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]'))).toBe('[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', function () {
      expect(serialisers.charclass(monoParsers.charclass('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', function () {
      expect(serialisers.charclass(monoParsers.charclass('\\t'))).toBe('\\t')
    })

    it('escapes control characters', function () {
      expect(serialisers.charclass(monoParsers.charclass('\\u0000'))).toBe('\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', function () {
      expect(serialisers.multiplier(monoParsers.multiplier('{2,}'))).toBe('{2,}')
    })

    it('works on built-ins', function () {
      expect(serialisers.multiplier(monoParsers.multiplier('{0,1}'))).toBe('?')
      expect(serialisers.multiplier(monoParsers.multiplier('?'))).toBe('?')
      expect(serialisers.multiplier(monoParsers.multiplier('{1,1}'))).toBe('')
      expect(serialisers.multiplier(monoParsers.multiplier('{1}'))).toBe('')
      expect(serialisers.multiplier(monoParsers.multiplier(''))).toBe('')
      expect(serialisers.multiplier(monoParsers.multiplier('{0,}'))).toBe('*')
      expect(serialisers.multiplier(monoParsers.multiplier('*'))).toBe('*')
      expect(serialisers.multiplier(monoParsers.multiplier('{1,}'))).toBe('+')
      expect(serialisers.multiplier(monoParsers.multiplier('+'))).toBe('+')
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(serialisers.mult(monoParsers.mult('a{1,1}'))).toBe('a')
      expect(serialisers.mult(monoParsers.mult('a{1}'))).toBe('a')
      expect(serialisers.mult(monoParsers.mult('a'))).toBe('a')
      expect(serialisers.mult(monoParsers.mult('a{2,2}'))).toBe('a{2}')
      expect(serialisers.mult(monoParsers.mult('a{2}'))).toBe('a{2}')
      expect(serialisers.mult(monoParsers.mult('a{3,3}'))).toBe('a{3}')
      expect(serialisers.mult(monoParsers.mult('a{3}'))).toBe('a{3}')
      expect(serialisers.mult(monoParsers.mult('a{4,4}'))).toBe('a{4}')
      expect(serialisers.mult(monoParsers.mult('a{4}'))).toBe('a{4}')
      expect(serialisers.mult(monoParsers.mult('a{5,5}'))).toBe('a{5}')
      expect(serialisers.mult(monoParsers.mult('a{5}'))).toBe('a{5}')
      expect(serialisers.mult(monoParsers.mult('a{0,1}'))).toBe('a?')
      expect(serialisers.mult(monoParsers.mult('a?'))).toBe('a?')
      expect(serialisers.mult(monoParsers.mult('a{0,}'))).toBe('a*')
      expect(serialisers.mult(monoParsers.mult('a*'))).toBe('a*')
      expect(serialisers.mult(monoParsers.mult('a{1,}'))).toBe('a+')
      expect(serialisers.mult(monoParsers.mult('a+'))).toBe('a+')
      expect(serialisers.mult(monoParsers.mult('a{2,5}'))).toBe('a{2,5}')
      expect(serialisers.mult(monoParsers.mult('a{2,}'))).toBe('a{2,}')
    })

    it('works on built-in multiplicands', function () {
      expect(serialisers.mult(monoParsers.mult('[0-9]{1,1}'))).toBe('\\d')
      expect(serialisers.mult(monoParsers.mult('[0-9]{2,2}'))).toBe('\\d{2}')
      expect(serialisers.mult(monoParsers.mult('[0-9]{3,3}'))).toBe('\\d{3}')
    })
  })

  describe('pattern', function () {
    it('works', function () {
      expect(serialisers.pattern(monoParsers.pattern('a|b'))).toBe('a|b')
      expect(serialisers.pattern(monoParsers.pattern('a|a'))).toBe('a|a')
      expect(serialisers.pattern(monoParsers.pattern('abc|def'))).toBe('abc|def')
      expect(serialisers.pattern(monoParsers.pattern('()'))).toBe('()')
      expect(serialisers.pattern(monoParsers.pattern('(ghi)'))).toBe('(ghi)')
      expect(serialisers.pattern(monoParsers.pattern('(ghi|jkl)'))).toBe('(ghi|jkl)')
      expect(serialisers.pattern(monoParsers.pattern('abc|def(ghi|jkl)'))).toBe('abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', function () {
      expect(serialisers.pattern(monoParsers.pattern('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('round trips', function () {
      expect(serialisers.pattern(monoParsers.pattern('a.b'))).toBe('a.b') // not "a[ab]b"
      expect(serialisers.pattern(monoParsers.pattern('\\d{4}'))).toBe('\\d{4}')
      expect(serialisers.pattern(monoParsers.pattern('a.b()()'))).toBe('a.b()()')
    })
  })
})
