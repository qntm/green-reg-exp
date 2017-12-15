/* eslint-env jasmine */

'use strict'

const monoParsers = require('../src/mono-parsers.js')
const serialise = require('../src/serialise.js')

describe('serialise', function () {
  describe('charclass', function () {
    it('works for builtins', function () {
      expect(serialise(monoParsers.charclass('\\w'))).toBe('\\w')
      expect(serialise(monoParsers.charclass('\\W'))).toBe('\\W')
      expect(serialise(monoParsers.charclass('\\d'))).toBe('\\d')
      expect(serialise(monoParsers.charclass('\\D'))).toBe('\\D')
      expect(serialise(monoParsers.charclass('\\s'))).toBe('\\s')
      expect(serialise(monoParsers.charclass('\\S'))).toBe('\\S')
      expect(serialise(monoParsers.charclass('[]'))).toBe('[]')
      expect(serialise(monoParsers.charclass('.'))).toBe('.')
    })

    it('works', function () {
      expect(serialise(monoParsers.charclass('a'))).toBe('a')
      expect(serialise(monoParsers.charclass('\\{'))).toBe('\\{')
      expect(serialise(monoParsers.charclass('\\t'))).toBe('\\t')
      expect(serialise(monoParsers.charclass('[ab]'))).toBe('[ab]')
      expect(serialise(monoParsers.charclass('[a{]'))).toBe('[a{]')
      expect(serialise(monoParsers.charclass('[a\\t]'))).toBe('[\\ta]')
      expect(serialise(monoParsers.charclass('[a\\-]'))).toBe('[\\-a]')
      expect(serialise(monoParsers.charclass('[a\\[]'))).toBe('[\\[a]')
      expect(serialise(monoParsers.charclass('[a\\]]'))).toBe('[\\]a]')
      expect(serialise(monoParsers.charclass('[abc]'))).toBe('[abc]')
      expect(serialise(monoParsers.charclass('[abcd]'))).toBe('[a-d]')
      expect(serialise(monoParsers.charclass('[abcdfghi]'))).toBe('[a-df-i]')
      expect(serialise(monoParsers.charclass('\\^'))).toBe('\\^')
      expect(serialise(monoParsers.charclass('[\\^]'))).toBe('\\^')
      expect(serialise(monoParsers.charclass('\\\\'))).toBe('\\\\')
      expect(serialise(monoParsers.charclass('[\\\\]'))).toBe('\\\\')
      expect(serialise(monoParsers.charclass('[a\\^]'))).toBe('[\\^a]')
      expect(serialise(monoParsers.charclass('[0a123457896]'))).toBe('[0-9a]')
      expect(serialise(monoParsers.charclass('[\\t\\v\\r A]'))).toBe('[\\t\\v\\r A]')
      expect(serialise(monoParsers.charclass('[\\n\\f A]'))).toBe('[\\n\\f A]')
      expect(serialise(monoParsers.charclass('[\\t\\n\\v\\f\\r A]'))).toBe('[\\t-\\r A]')
      expect(serialise(monoParsers.charclass('.'))).toBe('.')
      expect(serialise(monoParsers.charclass('[^]'))).toBe('.')
      expect(serialise(monoParsers.charclass('[^a]'))).toBe('[^a]')
      expect(serialise(monoParsers.charclass('[^{]'))).toBe('[^{]')
      expect(serialise(monoParsers.charclass('[^\\t]'))).toBe('[^\\t]')
      expect(serialise(monoParsers.charclass('[^\\^]'))).toBe('[^\\^]')
    })

    it('works for a long range', function () {
      expect(serialise(monoParsers.charclass('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]'))).toBe('[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', function () {
      expect(serialise(monoParsers.charclass('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', function () {
      expect(serialise(monoParsers.charclass('\\t'))).toBe('\\t')
    })

    it('escapes control characters', function () {
      expect(serialise(monoParsers.charclass('\\u0000'))).toBe('\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', function () {
      expect(serialise(monoParsers.multiplier('{2,}'))).toBe('{2,}')
    })

    it('works on built-ins', function () {
      expect(serialise(monoParsers.multiplier('{0,1}'))).toBe('?')
      expect(serialise(monoParsers.multiplier('?'))).toBe('?')
      expect(serialise(monoParsers.multiplier('{1,1}'))).toBe('')
      expect(serialise(monoParsers.multiplier('{1}'))).toBe('')
      expect(serialise(monoParsers.multiplier(''))).toBe('')
      expect(serialise(monoParsers.multiplier('{0,}'))).toBe('*')
      expect(serialise(monoParsers.multiplier('*'))).toBe('*')
      expect(serialise(monoParsers.multiplier('{1,}'))).toBe('+')
      expect(serialise(monoParsers.multiplier('+'))).toBe('+')
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(serialise(monoParsers.mult('a{1,1}'))).toBe('a')
      expect(serialise(monoParsers.mult('a{1}'))).toBe('a')
      expect(serialise(monoParsers.mult('a'))).toBe('a')
      expect(serialise(monoParsers.mult('a{2,2}'))).toBe('a{2}')
      expect(serialise(monoParsers.mult('a{2}'))).toBe('a{2}')
      expect(serialise(monoParsers.mult('a{3,3}'))).toBe('a{3}')
      expect(serialise(monoParsers.mult('a{3}'))).toBe('a{3}')
      expect(serialise(monoParsers.mult('a{4,4}'))).toBe('a{4}')
      expect(serialise(monoParsers.mult('a{4}'))).toBe('a{4}')
      expect(serialise(monoParsers.mult('a{5,5}'))).toBe('a{5}')
      expect(serialise(monoParsers.mult('a{5}'))).toBe('a{5}')
      expect(serialise(monoParsers.mult('a{0,1}'))).toBe('a?')
      expect(serialise(monoParsers.mult('a?'))).toBe('a?')
      expect(serialise(monoParsers.mult('a{0,}'))).toBe('a*')
      expect(serialise(monoParsers.mult('a*'))).toBe('a*')
      expect(serialise(monoParsers.mult('a{1,}'))).toBe('a+')
      expect(serialise(monoParsers.mult('a+'))).toBe('a+')
      expect(serialise(monoParsers.mult('a{2,5}'))).toBe('a{2,5}')
      expect(serialise(monoParsers.mult('a{2,}'))).toBe('a{2,}')
    })

    it('works on built-in multiplicands', function () {
      expect(serialise(monoParsers.mult('[0-9]{1,1}'))).toBe('\\d')
      expect(serialise(monoParsers.mult('[0-9]{2,2}'))).toBe('\\d{2}')
      expect(serialise(monoParsers.mult('[0-9]{3,3}'))).toBe('\\d{3}')
    })
  })

  describe('pattern', function () {
    it('works', function () {
      expect(serialise(monoParsers.pattern('a|b'))).toBe('a|b')
      expect(serialise(monoParsers.pattern('a|a'))).toBe('a|a')
      expect(serialise(monoParsers.pattern('abc|def'))).toBe('abc|def')
      expect(serialise(monoParsers.pattern('()'))).toBe('()')
      expect(serialise(monoParsers.pattern('(ghi)'))).toBe('(ghi)')
      expect(serialise(monoParsers.pattern('(ghi|jkl)'))).toBe('(ghi|jkl)')
      expect(serialise(monoParsers.pattern('abc|def(ghi|jkl)'))).toBe('abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', function () {
      expect(serialise(monoParsers.pattern('[:;<=>?@\\[\\\\\\]\\^`]'))).toBe('[:-@\\[-\\^`]')
    })

    it('round trips', function () {
      expect(serialise(monoParsers.pattern('a.b'))).toBe('a.b') // not "a[ab]b"
      expect(serialise(monoParsers.pattern('\\d{4}'))).toBe('\\d{4}')
      expect(serialise(monoParsers.pattern('a.b()()'))).toBe('a.b()()')
    })
  })
})
