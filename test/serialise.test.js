import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import matchers from '../src/matchers.js'

describe('serialise', () => {
  describe('charclass', () => {
    it('works for builtins', () => {
      assert.equal(matchers.charclass.parse1('\\w').serialise(), '\\w')
      assert.equal(matchers.charclass.parse1('\\W').serialise(), '\\W')
      assert.equal(matchers.charclass.parse1('\\d').serialise(), '\\d')
      assert.equal(matchers.charclass.parse1('\\D').serialise(), '\\D')
      assert.equal(matchers.charclass.parse1('\\s').serialise(), '\\s')
      assert.equal(matchers.charclass.parse1('\\S').serialise(), '\\S')
      assert.equal(matchers.charclass.parse1('[]').serialise(), '[]')
      assert.equal(matchers.charclass.parse1('.').serialise(), '.')
    })

    it('works', () => {
      assert.equal(matchers.charclass.parse1('a').serialise(), 'a')
      assert.equal(matchers.charclass.parse1('\\{').serialise(), '\\{')
      assert.equal(matchers.charclass.parse1('\\t').serialise(), '\\t')
      assert.equal(matchers.charclass.parse1('[ab]').serialise(), '[ab]')
      assert.equal(matchers.charclass.parse1('[a{]').serialise(), '[a{]')
      assert.equal(matchers.charclass.parse1('[a\\t]').serialise(), '[\\ta]')
      assert.equal(matchers.charclass.parse1('[a\\-]').serialise(), '[\\-a]')
      assert.equal(matchers.charclass.parse1('[a\\[]').serialise(), '[\\[a]')
      assert.equal(matchers.charclass.parse1('[a\\]]').serialise(), '[\\]a]')
      assert.equal(matchers.charclass.parse1('[abc]').serialise(), '[abc]')
      assert.equal(matchers.charclass.parse1('[abcd]').serialise(), '[a-d]')
      assert.equal(matchers.charclass.parse1('[abcdfghi]').serialise(), '[a-df-i]')
      assert.equal(matchers.charclass.parse1('\\^').serialise(), '\\^')
      assert.equal(matchers.charclass.parse1('[\\^]').serialise(), '\\^')
      assert.equal(matchers.charclass.parse1('\\\\').serialise(), '\\\\')
      assert.equal(matchers.charclass.parse1('[\\\\]').serialise(), '\\\\')
      assert.equal(matchers.charclass.parse1('[a\\^]').serialise(), '[\\^a]')
      assert.equal(matchers.charclass.parse1('[0a123457896]').serialise(), '[0-9a]')
      assert.equal(matchers.charclass.parse1('[\\t\\v\\r A]').serialise(), '[\\t\\v\\r A]')
      assert.equal(matchers.charclass.parse1('[\\n\\f A]').serialise(), '[\\n\\f A]')
      assert.equal(matchers.charclass.parse1('[\\t\\n\\v\\f\\r A]').serialise(), '[\\t-\\r A]')
      assert.equal(matchers.charclass.parse1('.').serialise(), '.')
      assert.equal(matchers.charclass.parse1('[^]').serialise(), '.')
      assert.equal(matchers.charclass.parse1('[^a]').serialise(), '[^a]')
      assert.equal(matchers.charclass.parse1('[^{]').serialise(), '[^{]')
      assert.equal(matchers.charclass.parse1('[^\\t]').serialise(), '[^\\t]')
      assert.equal(matchers.charclass.parse1('[^\\^]').serialise(), '[^\\^]')
    })

    it('works for a long range', () => {
      assert.equal(matchers.charclass.parse1('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]').serialise(), '[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', () => {
      assert.equal(matchers.charclass.parse1('[:;<=>?@\\[\\\\\\]\\^`]').serialise(), '[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', () => {
      assert.equal(matchers.charclass.parse1('\\t').serialise(), '\\t')
    })

    it('escapes control characters', () => {
      assert.equal(matchers.charclass.parse1('\\u0000').serialise(), '\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', () => {
      assert.equal(matchers.multiplier.parse1('{2,}').serialise(), '{2,}')
    })

    it('works on built-ins', () => {
      assert.equal(matchers.multiplier.parse1('{0,1}').serialise(), '?')
      assert.equal(matchers.multiplier.parse1('?').serialise(), '?')
      assert.equal(matchers.multiplier.parse1('{1,1}').serialise(), '')
      assert.equal(matchers.multiplier.parse1('{1}').serialise(), '')
      assert.equal(matchers.multiplier.parse1('').serialise(), '')
      assert.equal(matchers.multiplier.parse1('{0,}').serialise(), '*')
      assert.equal(matchers.multiplier.parse1('*').serialise(), '*')
      assert.equal(matchers.multiplier.parse1('{1,}').serialise(), '+')
      assert.equal(matchers.multiplier.parse1('+').serialise(), '+')
    })
  })

  describe('mult', () => {
    it('works', () => {
      assert.equal(matchers.mult.parse1('a{1,1}').serialise(), 'a')
      assert.equal(matchers.mult.parse1('a{1}').serialise(), 'a')
      assert.equal(matchers.mult.parse1('a').serialise(), 'a')
      assert.equal(matchers.mult.parse1('a{2,2}').serialise(), 'a{2}')
      assert.equal(matchers.mult.parse1('a{2}').serialise(), 'a{2}')
      assert.equal(matchers.mult.parse1('a{3,3}').serialise(), 'a{3}')
      assert.equal(matchers.mult.parse1('a{3}').serialise(), 'a{3}')
      assert.equal(matchers.mult.parse1('a{4,4}').serialise(), 'a{4}')
      assert.equal(matchers.mult.parse1('a{4}').serialise(), 'a{4}')
      assert.equal(matchers.mult.parse1('a{5,5}').serialise(), 'a{5}')
      assert.equal(matchers.mult.parse1('a{5}').serialise(), 'a{5}')
      assert.equal(matchers.mult.parse1('a{0,1}').serialise(), 'a?')
      assert.equal(matchers.mult.parse1('a?').serialise(), 'a?')
      assert.equal(matchers.mult.parse1('a{0,}').serialise(), 'a*')
      assert.equal(matchers.mult.parse1('a*').serialise(), 'a*')
      assert.equal(matchers.mult.parse1('a{1,}').serialise(), 'a+')
      assert.equal(matchers.mult.parse1('a+').serialise(), 'a+')
      assert.equal(matchers.mult.parse1('a{2,5}').serialise(), 'a{2,5}')
      assert.equal(matchers.mult.parse1('a{2,}').serialise(), 'a{2,}')
    })

    it('works on built-in multiplicands', () => {
      assert.equal(matchers.mult.parse1('[0-9]{1,1}').serialise(), '\\d')
      assert.equal(matchers.mult.parse1('[0-9]{2,2}').serialise(), '\\d{2}')
      assert.equal(matchers.mult.parse1('[0-9]{3,3}').serialise(), '\\d{3}')
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.equal(matchers.pattern.parse1('a|b').serialise(), 'a|b')
      assert.equal(matchers.pattern.parse1('a|a').serialise(), 'a|a')
      assert.equal(matchers.pattern.parse1('abc|def').serialise(), 'abc|def')
      assert.equal(matchers.pattern.parse1('()').serialise(), '()')
      assert.equal(matchers.pattern.parse1('(ghi)').serialise(), '(ghi)')
      assert.equal(matchers.pattern.parse1('(ghi|jkl)').serialise(), '(ghi|jkl)')
      assert.equal(matchers.pattern.parse1('abc|def(ghi|jkl)').serialise(), 'abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', () => {
      assert.equal(matchers.pattern.parse1('[:;<=>?@\\[\\\\\\]\\^`]').serialise(), '[:-@\\[-\\^`]')
    })

    it('round trips', () => {
      assert.equal(matchers.pattern.parse1('a.b').serialise(), 'a.b') // not "a[ab]b"
      assert.equal(matchers.pattern.parse1('\\d{4}').serialise(), '\\d{4}')
      assert.equal(matchers.pattern.parse1('a.b()()').serialise(), 'a.b()()')
    })
  })
})
