/* eslint-env mocha */

import assert from 'node:assert/strict'

import * as constructors from '../src/constructors.js'
import matchers from '../src/matchers.js'

describe('reduce', () => {
  describe('charclass', () => {
    it('works', () => {
      assert.deepEqual(matchers.charclass.parse1('\\w').reduced(), matchers.charclass.parse1('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      assert.deepEqual(
        new constructors.Multiplicand(
          new constructors.Pattern([])
        ).reduced(),
        matchers.multiplicand.parse1('[]')
      )

      assert.deepEqual(
        matchers.multiplicand.parse1('([ab])').reduced(),
        matchers.multiplicand.parse1('[ab]')
      )
    })
  })

  describe('mult', () => {
    it('works', () => {
      assert.deepEqual(matchers.mult.parse1('([ab])*').reduced(), matchers.mult.parse1('[ab]*'))
      assert.notDeepEqual(matchers.mult.parse1('([ab]*)').reduced(), matchers.mult.parse1('[ab]*'))
    })
  })

  describe('conc', () => {
    it('come on', () => {
      assert.deepEqual(matchers.conc.parse1('(d())').reduced(), matchers.conc.parse1('d'))
      assert.deepEqual(matchers.conc.parse1('((a))').reduced(), matchers.conc.parse1('a'))
      assert.deepEqual(matchers.conc.parse1('(d(a))').reduced(), matchers.conc.parse1('da'))
    })

    it('this one', () => {
      assert.deepEqual(matchers.conc.parse1('(|c)').reduced(), matchers.conc.parse1('(|c)'))
    })

    it('what', () => {
      assert.deepEqual(matchers.conc.parse1('(c)').reduced(), matchers.conc.parse1('c'))
      assert.notDeepEqual(matchers.conc.parse1('((c))').reduced(), matchers.conc.parse1(''))
      assert.deepEqual(matchers.conc.parse1('((c))').reduced(), matchers.conc.parse1('c'))
      assert.deepEqual(matchers.conc.parse1('(|c)').reduced(), matchers.conc.parse1('(|c)'))
      assert.deepEqual(matchers.conc.parse1('((|c))').reduced(), matchers.conc.parse1('(|c)'))
      assert.deepEqual(matchers.conc.parse1('((a|c))').reduced(), matchers.conc.parse1('[ac]'))
      assert.deepEqual(matchers.conc.parse1('(d(a|c))').reduced(), matchers.conc.parse1('d[ac]'))
      assert.deepEqual(matchers.conc.parse1('(d(ab|c))').reduced(), matchers.conc.parse1('d(ab|c)'))
      assert.deepEqual(matchers.conc.parse1('a(d(ab|c))').reduced(), matchers.conc.parse1('ad(ab|c)'))
      assert.deepEqual(matchers.conc.parse1('a(d(ab|a*c))').reduced(), matchers.conc.parse1('ad(ab|a*c)'))
    })

    it('works', () => {
      assert.deepEqual(matchers.conc.parse1('abc[]*def').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepEqual(matchers.conc.parse1('abc[]{0}def').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepEqual(matchers.conc.parse1('[]?').reduced(), matchers.conc.parse1(''))
      assert.deepEqual(matchers.conc.parse1('([ab])*').reduced(), matchers.conc.parse1('[ab]*'))
      assert.deepEqual(matchers.conc.parse1('abc()d()ef').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepEqual(matchers.conc.parse1('a(d(abc))').reduced(), matchers.conc.parse1('adabc'))
      assert.deepEqual(matchers.conc.parse1('abc(de)f').reduced(), matchers.conc.parse1('abcdef'))
      assert.deepEqual(matchers.conc.parse1('abc[]def').reduced(), matchers.conc.parse1('[]'))
      assert.deepEqual(matchers.conc.parse1('ab[]c[]').reduced(), matchers.conc.parse1('[]'))
      assert.deepEqual(matchers.conc.parse1('[]').reduced(), matchers.conc.parse1('[]'))
      assert.deepEqual(matchers.conc.parse1('(((aby)))').reduced(), matchers.conc.parse1('aby'))
      assert.deepEqual(matchers.conc.parse1('(aaaa)').reduced(), matchers.conc.parse1('aaaa'))
      assert.deepEqual(matchers.conc.parse1('()').reduced(), matchers.conc.parse1(''))
      assert.deepEqual(matchers.conc.parse1('(()())').reduced(), matchers.conc.parse1(''))
      assert.deepEqual(matchers.conc.parse1('((((()))))((())())').reduced(), matchers.conc.parse1(''))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.deepEqual(matchers.pattern.parse1('((a))').reduced(), matchers.pattern.parse1('a'))
      assert.deepEqual(matchers.pattern.parse1('((ac))').reduced(), matchers.pattern.parse1('ac'))
      assert.deepEqual(matchers.pattern.parse1('(abc|[]|def)').reduced(), matchers.pattern.parse1('(abc|def)'))
      assert.deepEqual(matchers.pattern.parse1('(|[]|)').reduced(), matchers.pattern.parse1(''))
      assert.deepEqual(matchers.pattern.parse1('[]').reduced(), new constructors.Pattern([]))
      assert.deepEqual(matchers.pattern.parse1('([ab])*').reduced(), matchers.pattern.parse1('[ab]*'))
      assert.deepEqual(matchers.pattern.parse1('abc|abc').reduced(), matchers.pattern.parse1('abc'))
    })

    it('combines charclasses', () => {
      assert.deepEqual(matchers.pattern.parse1('a|b').reduced(), matchers.pattern.parse1('[ab]'))
      assert.deepEqual(matchers.pattern.parse1('a|b*').reduced(), matchers.pattern.parse1('a|b*'))
      assert.deepEqual(matchers.pattern.parse1('a|bc').reduced(), matchers.pattern.parse1('a|bc'))
      assert.deepEqual(matchers.pattern.parse1('a|b|c').reduced(), matchers.pattern.parse1('[abc]'))
      assert.deepEqual(matchers.pattern.parse1('[abc]|[cde]').reduced(), matchers.pattern.parse1('[a-e]'))
      assert.deepEqual(matchers.pattern.parse1('[a]|[^ab]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepEqual(matchers.pattern.parse1('[a]|[^ab]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepEqual(matchers.pattern.parse1('[^abc]|[bc]').reduced(), matchers.pattern.parse1('[^a]'))
      assert.deepEqual(matchers.pattern.parse1('[^abc]|[abc]').reduced(), matchers.pattern.parse1('.'))
      assert.deepEqual(matchers.pattern.parse1('[^ab]|[^bc]').reduced(), matchers.pattern.parse1('[^b]'))
      assert.deepEqual(matchers.pattern.parse1('((a|c))').reduced(), matchers.pattern.parse1('[ac]'))
      assert.deepEqual(matchers.pattern.parse1('[2-9]|0').reduced(), matchers.pattern.parse1('[2-90]'))
      assert.deepEqual(matchers.pattern.parse1('[1-9]|0').reduced(), matchers.pattern.parse1('[1-90]'))
    })
  })
})
