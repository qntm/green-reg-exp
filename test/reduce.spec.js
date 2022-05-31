/* eslint-env mocha */

import assert from 'assert'

import constructors from '../src/constructors.js'
import matchers from '../src/matchers.js'
import reduce from '../src/reduce.js'

describe('reduce', function () {
  describe('charclass', function () {
    it('works', function () {
      assert.deepStrictEqual(reduce(matchers.charclass.parse1('\\w')), matchers.charclass.parse1('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      assert.deepStrictEqual(
        reduce(
          constructors.multiplicand(
            constructors.pattern([])
          )
        ),
        matchers.multiplicand.parse1('[]')
      )

      assert.deepStrictEqual(
        reduce(matchers.multiplicand.parse1('([ab])')),
        matchers.multiplicand.parse1('[ab]')
      )
    })
  })

  describe('mult', function () {
    it('works', function () {
      assert.deepStrictEqual(reduce(matchers.mult.parse1('([ab])*')), matchers.mult.parse1('[ab]*'))
      assert.notDeepStrictEqual(reduce(matchers.mult.parse1('([ab]*)')), matchers.mult.parse1('[ab]*'))
    })
  })

  describe('conc', () => {
    it('come on', () => {
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(d())')), matchers.conc.parse1('d'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('((a))')), matchers.conc.parse1('a'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(d(a))')), matchers.conc.parse1('da'))
    })

    it('this one', () => {
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(|c)')), matchers.conc.parse1('(|c)'))
    })

    it('what', () => {
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(c)')), matchers.conc.parse1('c'))
      assert.notDeepStrictEqual(reduce(matchers.conc.parse1('((c))')), matchers.conc.parse1(''))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('((c))')), matchers.conc.parse1('c'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(|c)')), matchers.conc.parse1('(|c)'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('((|c))')), matchers.conc.parse1('(|c)'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('((a|c))')), matchers.conc.parse1('[ac]'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(d(a|c))')), matchers.conc.parse1('d[ac]'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(d(ab|c))')), matchers.conc.parse1('d(ab|c)'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('a(d(ab|c))')), matchers.conc.parse1('ad(ab|c)'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('a(d(ab|a*c))')), matchers.conc.parse1('ad(ab|a*c)'))
    })

    it('works', () => {
      assert.deepStrictEqual(reduce(matchers.conc.parse1('abc[]*def')), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('abc[]{0}def')), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('[]?')), matchers.conc.parse1(''))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('([ab])*')), matchers.conc.parse1('[ab]*'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('abc()d()ef')), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('a(d(abc))')), matchers.conc.parse1('adabc'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('abc(de)f')), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('abc[]def')), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('ab[]c[]')), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('[]')), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(((aby)))')), matchers.conc.parse1('aby'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(aaaa)')), matchers.conc.parse1('aaaa'))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('()')), matchers.conc.parse1(''))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('(()())')), matchers.conc.parse1(''))
      assert.deepStrictEqual(reduce(matchers.conc.parse1('((((()))))((())())')), matchers.conc.parse1(''))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('((a))')), matchers.pattern.parse1('a'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('((ac))')), matchers.pattern.parse1('ac'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('(abc|[]|def)')), matchers.pattern.parse1('(abc|def)'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('(|[]|)')), matchers.pattern.parse1(''))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[]')), constructors.pattern([]))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('([ab])*')), matchers.pattern.parse1('[ab]*'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('abc|abc')), matchers.pattern.parse1('abc'))
    })

    it('combines charclasses', () => {
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('a|b')), matchers.pattern.parse1('[ab]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('a|b*')), matchers.pattern.parse1('a|b*'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('a|bc')), matchers.pattern.parse1('a|bc'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('a|b|c')), matchers.pattern.parse1('[abc]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[abc]|[cde]')), matchers.pattern.parse1('[a-e]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[a]|[^ab]')), matchers.pattern.parse1('[^b]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[a]|[^ab]')), matchers.pattern.parse1('[^b]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[^abc]|[bc]')), matchers.pattern.parse1('[^a]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[^abc]|[abc]')), matchers.pattern.parse1('.'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('((a|c))')), matchers.pattern.parse1('[ac]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[2-9]|0')), matchers.pattern.parse1('[2-90]'))
      assert.deepStrictEqual(reduce(matchers.pattern.parse1('[1-9]|0')), matchers.pattern.parse1('[1-90]'))
    })
  })
})
