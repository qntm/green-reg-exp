/* eslint-env mocha */

import assert from 'assert'

import { arrayOps } from '../src/array-ops.js'

describe('arrayOps', () => {
  describe('and', () => {
    it('works', () => {
      assert.deepStrictEqual(arrayOps.and([], []), [])
      assert.deepStrictEqual(arrayOps.and(['a', 'b', 'c'], []), [])
      assert.deepStrictEqual(arrayOps.and(['a', 'b', 'c'], ['b', 'c', 'd']), ['b', 'c'])
      assert.deepStrictEqual(arrayOps.and(['a', 'b', 'c'], ['c', 'b', 'a']), ['a', 'b', 'c'])
    })
  })

  describe('or', () => {
    it('works', () => {
      assert.deepStrictEqual(arrayOps.or([], []), [])
      assert.deepStrictEqual(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'c']), ['a', 'b', 'c'])
      assert.deepStrictEqual(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'd']), ['a', 'b', 'c', 'd'])
    })
  })

  describe('minus', () => {
    it('works', () => {
      assert.deepStrictEqual(arrayOps.minus(['a', 'b', 'c'], []), ['a', 'b', 'c'])
      assert.deepStrictEqual(arrayOps.minus(['a', 'b', 'c'], ['c', 'd', 'e']), ['a', 'b'])
    })
  })

  describe('equal', () => {
    it('works', () => {
      assert.strictEqual(arrayOps.equal(['a', 'b', 'c'], ['a', 'b']), false)
      assert.strictEqual(arrayOps.equal(['a', 'b', 'c'], ['a', 'b', 'c']), true)
      assert.strictEqual(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a']), true)
      assert.strictEqual(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a', 'c']), true)
    })
  })

  describe('product', () => {
    it('works', () => {
      assert.deepStrictEqual(arrayOps.product([]), [])
      assert.deepStrictEqual(arrayOps.product(['a']), [['a']])
      assert.deepStrictEqual(arrayOps.product(['a', 'b'], ['c', 'd', 'e']), [
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['b', 'c'],
        ['b', 'd'],
        ['b', 'e']
      ])
    })
  })
})
