/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'

describe('serialise', () => {
  describe('charclass', () => {
    it('works for builtins', () => {
      assert.strictEqual(matchers.charclass.parse1('\\w').serialise(), '\\w')
      assert.strictEqual(matchers.charclass.parse1('\\W').serialise(), '\\W')
      assert.strictEqual(matchers.charclass.parse1('\\d').serialise(), '\\d')
      assert.strictEqual(matchers.charclass.parse1('\\D').serialise(), '\\D')
      assert.strictEqual(matchers.charclass.parse1('\\s').serialise(), '\\s')
      assert.strictEqual(matchers.charclass.parse1('\\S').serialise(), '\\S')
      assert.strictEqual(matchers.charclass.parse1('[]').serialise(), '[]')
      assert.strictEqual(matchers.charclass.parse1('.').serialise(), '.')
    })

    it('works', () => {
      assert.strictEqual(matchers.charclass.parse1('a').serialise(), 'a')
      assert.strictEqual(matchers.charclass.parse1('\\{').serialise(), '\\{')
      assert.strictEqual(matchers.charclass.parse1('\\t').serialise(), '\\t')
      assert.strictEqual(matchers.charclass.parse1('[ab]').serialise(), '[ab]')
      assert.strictEqual(matchers.charclass.parse1('[a{]').serialise(), '[a{]')
      assert.strictEqual(matchers.charclass.parse1('[a\\t]').serialise(), '[\\ta]')
      assert.strictEqual(matchers.charclass.parse1('[a\\-]').serialise(), '[\\-a]')
      assert.strictEqual(matchers.charclass.parse1('[a\\[]').serialise(), '[\\[a]')
      assert.strictEqual(matchers.charclass.parse1('[a\\]]').serialise(), '[\\]a]')
      assert.strictEqual(matchers.charclass.parse1('[abc]').serialise(), '[abc]')
      assert.strictEqual(matchers.charclass.parse1('[abcd]').serialise(), '[a-d]')
      assert.strictEqual(matchers.charclass.parse1('[abcdfghi]').serialise(), '[a-df-i]')
      assert.strictEqual(matchers.charclass.parse1('\\^').serialise(), '\\^')
      assert.strictEqual(matchers.charclass.parse1('[\\^]').serialise(), '\\^')
      assert.strictEqual(matchers.charclass.parse1('\\\\').serialise(), '\\\\')
      assert.strictEqual(matchers.charclass.parse1('[\\\\]').serialise(), '\\\\')
      assert.strictEqual(matchers.charclass.parse1('[a\\^]').serialise(), '[\\^a]')
      assert.strictEqual(matchers.charclass.parse1('[0a123457896]').serialise(), '[0-9a]')
      assert.strictEqual(matchers.charclass.parse1('[\\t\\v\\r A]').serialise(), '[\\t\\v\\r A]')
      assert.strictEqual(matchers.charclass.parse1('[\\n\\f A]').serialise(), '[\\n\\f A]')
      assert.strictEqual(matchers.charclass.parse1('[\\t\\n\\v\\f\\r A]').serialise(), '[\\t-\\r A]')
      assert.strictEqual(matchers.charclass.parse1('.').serialise(), '.')
      assert.strictEqual(matchers.charclass.parse1('[^]').serialise(), '.')
      assert.strictEqual(matchers.charclass.parse1('[^a]').serialise(), '[^a]')
      assert.strictEqual(matchers.charclass.parse1('[^{]').serialise(), '[^{]')
      assert.strictEqual(matchers.charclass.parse1('[^\\t]').serialise(), '[^\\t]')
      assert.strictEqual(matchers.charclass.parse1('[^\\^]').serialise(), '[^\\^]')
    })

    it('works for a long range', () => {
      assert.strictEqual(matchers.charclass.parse1('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]').serialise(), '[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', () => {
      assert.strictEqual(matchers.charclass.parse1('[:;<=>?@\\[\\\\\\]\\^`]').serialise(), '[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', () => {
      assert.strictEqual(matchers.charclass.parse1('\\t').serialise(), '\\t')
    })

    it('escapes control characters', () => {
      assert.strictEqual(matchers.charclass.parse1('\\u0000').serialise(), '\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', () => {
      assert.strictEqual(matchers.multiplier.parse1('{2,}').serialise(), '{2,}')
    })

    it('works on built-ins', () => {
      assert.strictEqual(matchers.multiplier.parse1('{0,1}').serialise(), '?')
      assert.strictEqual(matchers.multiplier.parse1('?').serialise(), '?')
      assert.strictEqual(matchers.multiplier.parse1('{1,1}').serialise(), '')
      assert.strictEqual(matchers.multiplier.parse1('{1}').serialise(), '')
      assert.strictEqual(matchers.multiplier.parse1('').serialise(), '')
      assert.strictEqual(matchers.multiplier.parse1('{0,}').serialise(), '*')
      assert.strictEqual(matchers.multiplier.parse1('*').serialise(), '*')
      assert.strictEqual(matchers.multiplier.parse1('{1,}').serialise(), '+')
      assert.strictEqual(matchers.multiplier.parse1('+').serialise(), '+')
    })
  })

  describe('mult', () => {
    it('works', () => {
      assert.strictEqual(matchers.mult.parse1('a{1,1}').serialise(), 'a')
      assert.strictEqual(matchers.mult.parse1('a{1}').serialise(), 'a')
      assert.strictEqual(matchers.mult.parse1('a').serialise(), 'a')
      assert.strictEqual(matchers.mult.parse1('a{2,2}').serialise(), 'a{2}')
      assert.strictEqual(matchers.mult.parse1('a{2}').serialise(), 'a{2}')
      assert.strictEqual(matchers.mult.parse1('a{3,3}').serialise(), 'a{3}')
      assert.strictEqual(matchers.mult.parse1('a{3}').serialise(), 'a{3}')
      assert.strictEqual(matchers.mult.parse1('a{4,4}').serialise(), 'a{4}')
      assert.strictEqual(matchers.mult.parse1('a{4}').serialise(), 'a{4}')
      assert.strictEqual(matchers.mult.parse1('a{5,5}').serialise(), 'a{5}')
      assert.strictEqual(matchers.mult.parse1('a{5}').serialise(), 'a{5}')
      assert.strictEqual(matchers.mult.parse1('a{0,1}').serialise(), 'a?')
      assert.strictEqual(matchers.mult.parse1('a?').serialise(), 'a?')
      assert.strictEqual(matchers.mult.parse1('a{0,}').serialise(), 'a*')
      assert.strictEqual(matchers.mult.parse1('a*').serialise(), 'a*')
      assert.strictEqual(matchers.mult.parse1('a{1,}').serialise(), 'a+')
      assert.strictEqual(matchers.mult.parse1('a+').serialise(), 'a+')
      assert.strictEqual(matchers.mult.parse1('a{2,5}').serialise(), 'a{2,5}')
      assert.strictEqual(matchers.mult.parse1('a{2,}').serialise(), 'a{2,}')
    })

    it('works on built-in multiplicands', () => {
      assert.strictEqual(matchers.mult.parse1('[0-9]{1,1}').serialise(), '\\d')
      assert.strictEqual(matchers.mult.parse1('[0-9]{2,2}').serialise(), '\\d{2}')
      assert.strictEqual(matchers.mult.parse1('[0-9]{3,3}').serialise(), '\\d{3}')
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.strictEqual(matchers.pattern.parse1('a|b').serialise(), 'a|b')
      assert.strictEqual(matchers.pattern.parse1('a|a').serialise(), 'a|a')
      assert.strictEqual(matchers.pattern.parse1('abc|def').serialise(), 'abc|def')
      assert.strictEqual(matchers.pattern.parse1('()').serialise(), '()')
      assert.strictEqual(matchers.pattern.parse1('(ghi)').serialise(), '(ghi)')
      assert.strictEqual(matchers.pattern.parse1('(ghi|jkl)').serialise(), '(ghi|jkl)')
      assert.strictEqual(matchers.pattern.parse1('abc|def(ghi|jkl)').serialise(), 'abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', () => {
      assert.strictEqual(matchers.pattern.parse1('[:;<=>?@\\[\\\\\\]\\^`]').serialise(), '[:-@\\[-\\^`]')
    })

    it('round trips', () => {
      assert.strictEqual(matchers.pattern.parse1('a.b').serialise(), 'a.b') // not "a[ab]b"
      assert.strictEqual(matchers.pattern.parse1('\\d{4}').serialise(), '\\d{4}')
      assert.strictEqual(matchers.pattern.parse1('a.b()()').serialise(), 'a.b()()')
    })
  })
})
