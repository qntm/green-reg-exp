/* eslint-env jasmine */

'use strict'

const constructors = require('../src/constructors')
const monoParsers = require('../src/mono-parsers')
const reduce = require('../src/reduce')

describe('reduce', function () {
  describe('charclass', function () {
    it('works', function () {
      expect(reduce(monoParsers.charclass('\\w'))).toEqual(monoParsers.charclass('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      expect(reduce(
        constructors.multiplicand(
          constructors.pattern([])
        )
      )).toEqual(monoParsers.multiplicand('[]'))

      expect(reduce(monoParsers.multiplicand('([ab])')))
        .toEqual(monoParsers.multiplicand('[ab]'))
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(reduce(monoParsers.mult('([ab])*'))).toEqual(monoParsers.mult('[ab]*'))
      expect(reduce(monoParsers.mult('([ab]*)'))).not.toEqual(monoParsers.mult('[ab]*'))
    })
  })

  describe('conc', () => {
    it('come on', () => {
      expect(reduce(monoParsers.conc('(d())'))).toEqual(monoParsers.conc('d'))
      expect(reduce(monoParsers.conc('((a))'))).toEqual(monoParsers.conc('a'))
      expect(reduce(monoParsers.conc('(d(a))'))).toEqual(monoParsers.conc('da'))
    })

    it('this one', () => {
      expect(reduce(monoParsers.conc('(|c)'))).toEqual(monoParsers.conc('(|c)'))
    })

    it('what', () => {
      expect(reduce(monoParsers.conc('(c)'))).toEqual(monoParsers.conc('c'))
      expect(reduce(monoParsers.conc('((c))'))).not.toEqual(monoParsers.conc(''))
      expect(reduce(monoParsers.conc('((c))'))).toEqual(monoParsers.conc('c'))
      expect(reduce(monoParsers.conc('(|c)'))).toEqual(monoParsers.conc('(|c)'))
      expect(reduce(monoParsers.conc('((|c))'))).toEqual(monoParsers.conc('(|c)'))
      expect(reduce(monoParsers.conc('((a|c))'))).toEqual(monoParsers.conc('[ac]'))
      expect(reduce(monoParsers.conc('(d(a|c))'))).toEqual(monoParsers.conc('d[ac]'))
      expect(reduce(monoParsers.conc('(d(ab|c))'))).toEqual(monoParsers.conc('d(ab|c)'))
      expect(reduce(monoParsers.conc('a(d(ab|c))'))).toEqual(monoParsers.conc('ad(ab|c)'))
      expect(reduce(monoParsers.conc('a(d(ab|a*c))'))).toEqual(monoParsers.conc('ad(ab|a*c)'))
    })

    it('works', () => {
      expect(reduce(monoParsers.conc('abc[]*def'))).toEqual(monoParsers.conc('abcdef'))
      expect(reduce(monoParsers.conc('abc[]{0}def'))).toEqual(monoParsers.conc('abcdef'))
      expect(reduce(monoParsers.conc('[]?'))).toEqual(monoParsers.conc(''))
      expect(reduce(monoParsers.conc('([ab])*'))).toEqual(monoParsers.conc('[ab]*'))
      expect(reduce(monoParsers.conc('abc()d()ef'))).toEqual(monoParsers.conc('abcdef'))
      expect(reduce(monoParsers.conc('a(d(abc))'))).toEqual(monoParsers.conc('adabc'))
      expect(reduce(monoParsers.conc('abc(de)f'))).toEqual(monoParsers.conc('abcdef'))
      expect(reduce(monoParsers.conc('abc[]def'))).toEqual(monoParsers.conc('[]'))
      expect(reduce(monoParsers.conc('ab[]c[]'))).toEqual(monoParsers.conc('[]'))
      expect(reduce(monoParsers.conc('[]'))).toEqual(monoParsers.conc('[]'))
      expect(reduce(monoParsers.conc('(((aby)))'))).toEqual(monoParsers.conc('aby'))
      expect(reduce(monoParsers.conc('(aaaa)'))).toEqual(monoParsers.conc('aaaa'))
      expect(reduce(monoParsers.conc('()'))).toEqual(monoParsers.conc(''))
      expect(reduce(monoParsers.conc('(()())'))).toEqual(monoParsers.conc(''))
      expect(reduce(monoParsers.conc('((((()))))((())())'))).toEqual(monoParsers.conc(''))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      expect(reduce(monoParsers.pattern('((a))'))).toEqual(monoParsers.pattern('a'))
      expect(reduce(monoParsers.pattern('((ac))'))).toEqual(monoParsers.pattern('ac'))
      expect(reduce(monoParsers.pattern('(abc|[]|def)'))).toEqual(monoParsers.pattern('(abc|def)'))
      expect(reduce(monoParsers.pattern('(|[]|)'))).toEqual(monoParsers.pattern(''))
      expect(reduce(monoParsers.pattern('[]'))).toEqual(constructors.pattern([]))
      expect(reduce(monoParsers.pattern('([ab])*'))).toEqual(monoParsers.pattern('[ab]*'))
      expect(reduce(monoParsers.pattern('abc|abc'))).toEqual(monoParsers.pattern('abc'))
    })

    it('combines charclasses', () => {
      expect(reduce(monoParsers.pattern('a|b'))).toEqual(monoParsers.pattern('[ab]'))
      expect(reduce(monoParsers.pattern('a|b*'))).toEqual(monoParsers.pattern('a|b*'))
      expect(reduce(monoParsers.pattern('a|bc'))).toEqual(monoParsers.pattern('a|bc'))
      expect(reduce(monoParsers.pattern('a|b|c'))).toEqual(monoParsers.pattern('[abc]'))
      expect(reduce(monoParsers.pattern('[abc]|[cde]'))).toEqual(monoParsers.pattern('[a-e]'))
      expect(reduce(monoParsers.pattern('[a]|[^ab]'))).toEqual(monoParsers.pattern('[^b]'))
      expect(reduce(monoParsers.pattern('[a]|[^ab]'))).toEqual(monoParsers.pattern('[^b]'))
      expect(reduce(monoParsers.pattern('[^abc]|[bc]'))).toEqual(monoParsers.pattern('[^a]'))
      expect(reduce(monoParsers.pattern('[^abc]|[abc]'))).toEqual(monoParsers.pattern('.'))
      expect(reduce(monoParsers.pattern('((a|c))'))).toEqual(monoParsers.pattern('[ac]'))
      expect(reduce(monoParsers.pattern('[2-9]|0'))).toEqual(monoParsers.pattern('[2-90]'))
      expect(reduce(monoParsers.pattern('[1-9]|0'))).toEqual(monoParsers.pattern('[1-90]'))
    })
  })
})
