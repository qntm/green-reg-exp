/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'
import { serialise } from '../src/serialise.js'

describe('serialise', () => {
  describe('charclass', () => {
    it('works for builtins', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('\\w')), '\\w')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\W')), '\\W')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\d')), '\\d')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\D')), '\\D')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\s')), '\\s')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\S')), '\\S')
      assert.strictEqual(serialise(matchers.charclass.parse1('[]')), '[]')
      assert.strictEqual(serialise(matchers.charclass.parse1('.')), '.')
    })

    it('works', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('a')), 'a')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\{')), '\\{')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\t')), '\\t')
      assert.strictEqual(serialise(matchers.charclass.parse1('[ab]')), '[ab]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a{]')), '[a{]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a\\t]')), '[\\ta]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a\\-]')), '[\\-a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a\\[]')), '[\\[a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a\\]]')), '[\\]a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[abc]')), '[abc]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[abcd]')), '[a-d]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[abcdfghi]')), '[a-df-i]')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\^')), '\\^')
      assert.strictEqual(serialise(matchers.charclass.parse1('[\\^]')), '\\^')
      assert.strictEqual(serialise(matchers.charclass.parse1('\\\\')), '\\\\')
      assert.strictEqual(serialise(matchers.charclass.parse1('[\\\\]')), '\\\\')
      assert.strictEqual(serialise(matchers.charclass.parse1('[a\\^]')), '[\\^a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[0a123457896]')), '[0-9a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[\\t\\v\\r A]')), '[\\t\\v\\r A]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[\\n\\f A]')), '[\\n\\f A]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[\\t\\n\\v\\f\\r A]')), '[\\t-\\r A]')
      assert.strictEqual(serialise(matchers.charclass.parse1('.')), '.')
      assert.strictEqual(serialise(matchers.charclass.parse1('[^]')), '.')
      assert.strictEqual(serialise(matchers.charclass.parse1('[^a]')), '[^a]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[^{]')), '[^{]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[^\\t]')), '[^\\t]')
      assert.strictEqual(serialise(matchers.charclass.parse1('[^\\^]')), '[^\\^]')
    })

    it('works for a long range', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz|]')), '[0-9A-Z_a-z|]')
    })

    it('works for arbitrary ranges', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('[:;<=>?@\\[\\\\\\]\\^`]')), '[:-@\\[-\\^`]')
    })

    it('does not preserve escape sequences', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('\\t')), '\\t')
    })

    it('escapes control characters', () => {
      assert.strictEqual(serialise(matchers.charclass.parse1('\\u0000')), '\\u0000')
    })
  })

  describe('multiplier', () => {
    it('works', () => {
      assert.strictEqual(serialise(matchers.multiplier.parse1('{2,}')), '{2,}')
    })

    it('works on built-ins', () => {
      assert.strictEqual(serialise(matchers.multiplier.parse1('{0,1}')), '?')
      assert.strictEqual(serialise(matchers.multiplier.parse1('?')), '?')
      assert.strictEqual(serialise(matchers.multiplier.parse1('{1,1}')), '')
      assert.strictEqual(serialise(matchers.multiplier.parse1('{1}')), '')
      assert.strictEqual(serialise(matchers.multiplier.parse1('')), '')
      assert.strictEqual(serialise(matchers.multiplier.parse1('{0,}')), '*')
      assert.strictEqual(serialise(matchers.multiplier.parse1('*')), '*')
      assert.strictEqual(serialise(matchers.multiplier.parse1('{1,}')), '+')
      assert.strictEqual(serialise(matchers.multiplier.parse1('+')), '+')
    })
  })

  describe('mult', () => {
    it('works', () => {
      assert.strictEqual(serialise(matchers.mult.parse1('a{1,1}')), 'a')
      assert.strictEqual(serialise(matchers.mult.parse1('a{1}')), 'a')
      assert.strictEqual(serialise(matchers.mult.parse1('a')), 'a')
      assert.strictEqual(serialise(matchers.mult.parse1('a{2,2}')), 'a{2}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{2}')), 'a{2}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{3,3}')), 'a{3}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{3}')), 'a{3}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{4,4}')), 'a{4}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{4}')), 'a{4}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{5,5}')), 'a{5}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{5}')), 'a{5}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{0,1}')), 'a?')
      assert.strictEqual(serialise(matchers.mult.parse1('a?')), 'a?')
      assert.strictEqual(serialise(matchers.mult.parse1('a{0,}')), 'a*')
      assert.strictEqual(serialise(matchers.mult.parse1('a*')), 'a*')
      assert.strictEqual(serialise(matchers.mult.parse1('a{1,}')), 'a+')
      assert.strictEqual(serialise(matchers.mult.parse1('a+')), 'a+')
      assert.strictEqual(serialise(matchers.mult.parse1('a{2,5}')), 'a{2,5}')
      assert.strictEqual(serialise(matchers.mult.parse1('a{2,}')), 'a{2,}')
    })

    it('works on built-in multiplicands', () => {
      assert.strictEqual(serialise(matchers.mult.parse1('[0-9]{1,1}')), '\\d')
      assert.strictEqual(serialise(matchers.mult.parse1('[0-9]{2,2}')), '\\d{2}')
      assert.strictEqual(serialise(matchers.mult.parse1('[0-9]{3,3}')), '\\d{3}')
    })
  })

  describe('pattern', () => {
    it('works', () => {
      assert.strictEqual(serialise(matchers.pattern.parse1('a|b')), 'a|b')
      assert.strictEqual(serialise(matchers.pattern.parse1('a|a')), 'a|a')
      assert.strictEqual(serialise(matchers.pattern.parse1('abc|def')), 'abc|def')
      assert.strictEqual(serialise(matchers.pattern.parse1('()')), '()')
      assert.strictEqual(serialise(matchers.pattern.parse1('(ghi)')), '(ghi)')
      assert.strictEqual(serialise(matchers.pattern.parse1('(ghi|jkl)')), '(ghi|jkl)')
      assert.strictEqual(serialise(matchers.pattern.parse1('abc|def(ghi|jkl)')), 'abc|def(ghi|jkl)')
    })

    it('arbitrary ranges', () => {
      assert.strictEqual(serialise(matchers.pattern.parse1('[:;<=>?@\\[\\\\\\]\\^`]')), '[:-@\\[-\\^`]')
    })

    it('round trips', () => {
      assert.strictEqual(serialise(matchers.pattern.parse1('a.b')), 'a.b') // not "a[ab]b"
      assert.strictEqual(serialise(matchers.pattern.parse1('\\d{4}')), '\\d{4}')
      assert.strictEqual(serialise(matchers.pattern.parse1('a.b()()')), 'a.b()()')
    })
  })
})
