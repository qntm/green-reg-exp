/* eslint-env mocha */

import assert from 'assert'

import * as constructors from '../src/constructors.js'
import matchers from '../src/matchers.js'

describe('reduce', () => {
  describe('charclass', () => {
    it('works', () => {
      assert.deepStrictEqual(matchers.charclass.parse1('\\w').reduced(), matchers.charclass.parse1('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      assert.deepStrictEqual(
        new constructors.Multiplicand(
          new constructors.Pattern([])
        ).reduced(),
        matchers.multiplicand.parse1('[]')
      )

      assert.deepStrictEqual(
        matchers.multiplicand.parse1('([ab])').reduced(),
        matchers.multiplicand.parse1('[ab]')
      )
    })
  })

  describe('mult', () => {
    it('works', () => {
      assert.deepStrictEqual(matchers.mult.parse1('([ab])*').reduced(), matchers.mult.parse1('[ab]*'))
      assert.notDeepStrictEqual(matchers.mult.parse1('([ab]*)').reduced(), matchers.mult.parse1('[ab]*'))
    })
  })

  describe('conc', () => {
    it('come on', () => {
      assert.deepStrictEqual(matchers.conc.parse1('(d())').reduced(), matchers.conc.parse1('d'))
      assert.deepStrictEqual(matchers.conc.parse1('((a))').reduced(), matchers.conc.parse1('a'))
      assert.deepStrictEqual(matchers.conc.parse1('(d(a))').reduced(), matchers.conc.parse1('da'))
    })

    it('this one', () => {
      assert.deepStrictEqual(matchers.conc.parse1('(|c)').reduced(), matchers.conc.parse1('(|c)'))
    })

    it('what', () => {
      assert.deepStrictEqual(matchers.conc.parse1('(c)').reduced(), matchers.conc.parse1('c'))
      assert.notDeepStrictEqual(matchers.conc.parse1('((c))').reduced(), matchers.conc.parse1(''))
      assert.deepStrictEqual(matchers.conc.parse1('((c))').reduced(), matchers.conc.parse1('c'))
      assert.deepStrictEqual(matchers.conc.parse1('(|c)').reduced(), matchers.conc.parse1('(|c)'))
      assert.deepStrictEqual(matchers.conc.parse1('((|c))').reduced(), matchers.conc.parse1('(|c)'))
      assert.deepStrictEqual(matchers.conc.parse1('((a|c))').reduced(), matchers.conc.parse1('[ac]'))
      assert.deepStrictEqual(matchers.conc.parse1('(d(a|c))').reduced(), matchers.conc.parse1('d[ac]'))
      assert.deepStrictEqual(matchers.conc.parse1('(d(ab|c))').reduced(), matchers.conc.parse1('d(ab|c)'))
      assert.deepStrictEqual(matchers.conc.parse1('a(d(ab|c))').reduced(), matchers.conc.parse1('ad(ab|c)'))
      assert.deepStrictEqual(matchers.conc.parse1('a(d(ab|a*c))').reduced(), matchers.conc.parse1('ad(ab|a*c)'))
    })

    it('works', () => {
      assert.deepStrictEqual(matchers.conc.parse1('abc[]*def').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(matchers.conc.parse1('abc[]{0}def').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(matchers.conc.parse1('[]?').reduced(), matchers.conc.parse1(''))
      assert.deepStrictEqual(matchers.conc.parse1('([ab])*').reduced(), matchers.conc.parse1('[ab]*'))
      assert.deepStrictEqual(matchers.conc.parse1('abc()d()ef').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(matchers.conc.parse1('a(d(abc))').reduced(), matchers.conc.parse1('adabc'))
      assert.deepStrictEqual(matchers.conc.parse1('abc(de)f').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepStrictEqual(matchers.conc.parse1('abc[]def').reduced(), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(matchers.conc.parse1('ab[]c[]').reduced(), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(matchers.conc.parse1('[]').reduced(), matchers.conc.parse1('[]'))
      assert.deepStrictEqual(matchers.conc.parse1('(((aby)))').reduced(), matchers.conc.parse1('aby'))
      assert.deepStrictEqual(matchers.conc.parse1('(aaaa)').reduced(), matchers.conc.parse1('aaaa'))
      assert.deepStrictEqual(matchers.conc.parse1('()').reduced(), matchers.conc.parse1(''))
      assert.deepStrictEqual(matchers.conc.parse1('(()())').reduced(), matchers.conc.parse1(''))
      assert.deepStrictEqual(matchers.conc.parse1('((((()))))((())())').reduced(), matchers.conc.parse1(''))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.deepStrictEqual(matchers.pattern.parse1('((a))').reduced(), matchers.pattern.parse1('a'))
      assert.deepStrictEqual(matchers.pattern.parse1('((ac))').reduced(), matchers.pattern.parse1('ac'))
      assert.deepStrictEqual(matchers.pattern.parse1('(abc|[]|def)').reduced(), matchers.pattern.parse1('(abc|def)'))
      assert.deepStrictEqual(matchers.pattern.parse1('(|[]|)').reduced(), matchers.pattern.parse1(''))
      assert.deepStrictEqual(matchers.pattern.parse1('[]').reduced(), new constructors.Pattern([]))
      assert.deepStrictEqual(matchers.pattern.parse1('([ab])*').reduced(), matchers.pattern.parse1('[ab]*'))
      assert.deepStrictEqual(matchers.pattern.parse1('abc|abc').reduced(), matchers.pattern.parse1('abc'))
    })

    it('combines charclasses', () => {
      assert.deepStrictEqual(matchers.pattern.parse1('a|b').reduced(), matchers.pattern.parse1('[ab]'))
      assert.deepStrictEqual(matchers.pattern.parse1('a|b*').reduced(), matchers.pattern.parse1('a|b*'))
      assert.deepStrictEqual(matchers.pattern.parse1('a|bc').reduced(), matchers.pattern.parse1('a|bc'))
      assert.deepStrictEqual(matchers.pattern.parse1('a|b|c').reduced(), matchers.pattern.parse1('[abc]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[abc]|[cde]').reduced(), matchers.pattern.parse1('[a-e]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[a]|[^ab]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[a]|[^ab]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[^abc]|[bc]').reduced(), matchers.pattern.parse1('[^a]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[^abc]|[abc]').reduced(), matchers.pattern.parse1('.'))
      assert.deepStrictEqual(matchers.pattern.parse1('[^ab]|[^bc]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepStrictEqual(matchers.pattern.parse1('((a|c))').reduced(), matchers.pattern.parse1('[ac]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[2-9]|0').reduced(), matchers.pattern.parse1('[2-90]'))
      assert.deepStrictEqual(matchers.pattern.parse1('[1-9]|0').reduced(), matchers.pattern.parse1('[1-90]'))
    })
  })
})
