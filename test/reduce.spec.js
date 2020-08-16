/* eslint-env jasmine */

'use strict'

const constructors = require('../src/constructors')
const matchers = require('../src/matchers')
const reduce = require('../src/reduce')

describe('reduce', function () {
  describe('charclass', function () {
    it('works', function () {
      expect(reduce(matchers.charclass.parse1('\\w'))).toEqual(matchers.charclass.parse1('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      expect(reduce(
        constructors.multiplicand(
          constructors.pattern([])
        )
      )).toEqual(matchers.multiplicand.parse1('[]'))

      expect(reduce(matchers.multiplicand.parse1('([ab])')))
        .toEqual(matchers.multiplicand.parse1('[ab]'))
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(reduce(matchers.mult.parse1('([ab])*'))).toEqual(matchers.mult.parse1('[ab]*'))
      expect(reduce(matchers.mult.parse1('([ab]*)'))).not.toEqual(matchers.mult.parse1('[ab]*'))
    })
  })

  describe('conc', () => {
    it('come on', () => {
      expect(reduce(matchers.conc.parse1('(d())'))).toEqual(matchers.conc.parse1('d'))
      expect(reduce(matchers.conc.parse1('((a))'))).toEqual(matchers.conc.parse1('a'))
      expect(reduce(matchers.conc.parse1('(d(a))'))).toEqual(matchers.conc.parse1('da'))
    })

    it('this one', () => {
      expect(reduce(matchers.conc.parse1('(|c)'))).toEqual(matchers.conc.parse1('(|c)'))
    })

    it('what', () => {
      expect(reduce(matchers.conc.parse1('(c)'))).toEqual(matchers.conc.parse1('c'))
      expect(reduce(matchers.conc.parse1('((c))'))).not.toEqual(matchers.conc.parse1(''))
      expect(reduce(matchers.conc.parse1('((c))'))).toEqual(matchers.conc.parse1('c'))
      expect(reduce(matchers.conc.parse1('(|c)'))).toEqual(matchers.conc.parse1('(|c)'))
      expect(reduce(matchers.conc.parse1('((|c))'))).toEqual(matchers.conc.parse1('(|c)'))
      expect(reduce(matchers.conc.parse1('((a|c))'))).toEqual(matchers.conc.parse1('[ac]'))
      expect(reduce(matchers.conc.parse1('(d(a|c))'))).toEqual(matchers.conc.parse1('d[ac]'))
      expect(reduce(matchers.conc.parse1('(d(ab|c))'))).toEqual(matchers.conc.parse1('d(ab|c)'))
      expect(reduce(matchers.conc.parse1('a(d(ab|c))'))).toEqual(matchers.conc.parse1('ad(ab|c)'))
      expect(reduce(matchers.conc.parse1('a(d(ab|a*c))'))).toEqual(matchers.conc.parse1('ad(ab|a*c)'))
    })

    it('works', () => {
      expect(reduce(matchers.conc.parse1('abc[]*def'))).toEqual(matchers.conc.parse1('abcdef'))
      expect(reduce(matchers.conc.parse1('abc[]{0}def'))).toEqual(matchers.conc.parse1('abcdef'))
      expect(reduce(matchers.conc.parse1('[]?'))).toEqual(matchers.conc.parse1(''))
      expect(reduce(matchers.conc.parse1('([ab])*'))).toEqual(matchers.conc.parse1('[ab]*'))
      expect(reduce(matchers.conc.parse1('abc()d()ef'))).toEqual(matchers.conc.parse1('abcdef'))
      expect(reduce(matchers.conc.parse1('a(d(abc))'))).toEqual(matchers.conc.parse1('adabc'))
      expect(reduce(matchers.conc.parse1('abc(de)f'))).toEqual(matchers.conc.parse1('abcdef'))
      expect(reduce(matchers.conc.parse1('abc[]def'))).toEqual(matchers.conc.parse1('[]'))
      expect(reduce(matchers.conc.parse1('ab[]c[]'))).toEqual(matchers.conc.parse1('[]'))
      expect(reduce(matchers.conc.parse1('[]'))).toEqual(matchers.conc.parse1('[]'))
      expect(reduce(matchers.conc.parse1('(((aby)))'))).toEqual(matchers.conc.parse1('aby'))
      expect(reduce(matchers.conc.parse1('(aaaa)'))).toEqual(matchers.conc.parse1('aaaa'))
      expect(reduce(matchers.conc.parse1('()'))).toEqual(matchers.conc.parse1(''))
      expect(reduce(matchers.conc.parse1('(()())'))).toEqual(matchers.conc.parse1(''))
      expect(reduce(matchers.conc.parse1('((((()))))((())())'))).toEqual(matchers.conc.parse1(''))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      expect(reduce(matchers.pattern.parse1('((a))'))).toEqual(matchers.pattern.parse1('a'))
      expect(reduce(matchers.pattern.parse1('((ac))'))).toEqual(matchers.pattern.parse1('ac'))
      expect(reduce(matchers.pattern.parse1('(abc|[]|def)'))).toEqual(matchers.pattern.parse1('(abc|def)'))
      expect(reduce(matchers.pattern.parse1('(|[]|)'))).toEqual(matchers.pattern.parse1(''))
      expect(reduce(matchers.pattern.parse1('[]'))).toEqual(constructors.pattern([]))
      expect(reduce(matchers.pattern.parse1('([ab])*'))).toEqual(matchers.pattern.parse1('[ab]*'))
      expect(reduce(matchers.pattern.parse1('abc|abc'))).toEqual(matchers.pattern.parse1('abc'))
    })

    it('combines charclasses', () => {
      expect(reduce(matchers.pattern.parse1('a|b'))).toEqual(matchers.pattern.parse1('[ab]'))
      expect(reduce(matchers.pattern.parse1('a|b*'))).toEqual(matchers.pattern.parse1('a|b*'))
      expect(reduce(matchers.pattern.parse1('a|bc'))).toEqual(matchers.pattern.parse1('a|bc'))
      expect(reduce(matchers.pattern.parse1('a|b|c'))).toEqual(matchers.pattern.parse1('[abc]'))
      expect(reduce(matchers.pattern.parse1('[abc]|[cde]'))).toEqual(matchers.pattern.parse1('[a-e]'))
      expect(reduce(matchers.pattern.parse1('[a]|[^ab]'))).toEqual(matchers.pattern.parse1('[^b]'))
      expect(reduce(matchers.pattern.parse1('[a]|[^ab]'))).toEqual(matchers.pattern.parse1('[^b]'))
      expect(reduce(matchers.pattern.parse1('[^abc]|[bc]'))).toEqual(matchers.pattern.parse1('[^a]'))
      expect(reduce(matchers.pattern.parse1('[^abc]|[abc]'))).toEqual(matchers.pattern.parse1('.'))
      expect(reduce(matchers.pattern.parse1('((a|c))'))).toEqual(matchers.pattern.parse1('[ac]'))
      expect(reduce(matchers.pattern.parse1('[2-9]|0'))).toEqual(matchers.pattern.parse1('[2-90]'))
      expect(reduce(matchers.pattern.parse1('[1-9]|0'))).toEqual(matchers.pattern.parse1('[1-90]'))
    })
  })
})
