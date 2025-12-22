import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { arrayOps } from '../src/array-ops.js'

describe('arrayOps', () => {
  describe('and', () => {
    it('works', () => {
      assert.deepEqual(arrayOps.and([], []), [])
      assert.deepEqual(arrayOps.and(['a', 'b', 'c'], []), [])
      assert.deepEqual(arrayOps.and(['a', 'b', 'c'], ['b', 'c', 'd']), ['b', 'c'])
      assert.deepEqual(arrayOps.and(['a', 'b', 'c'], ['c', 'b', 'a']), ['a', 'b', 'c'])
    })
  })

  describe('or', () => {
    it('works', () => {
      assert.deepEqual(arrayOps.or([], []), [])
      assert.deepEqual(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'c']), ['a', 'b', 'c'])
      assert.deepEqual(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'd']), ['a', 'b', 'c', 'd'])
    })
  })

  describe('minus', () => {
    it('works', () => {
      assert.deepEqual(arrayOps.minus(['a', 'b', 'c'], []), ['a', 'b', 'c'])
      assert.deepEqual(arrayOps.minus(['a', 'b', 'c'], ['c', 'd', 'e']), ['a', 'b'])
    })
  })

  describe('equal', () => {
    it('works', () => {
      assert.equal(arrayOps.equal(['a', 'b', 'c'], ['a', 'b']), false)
      assert.equal(arrayOps.equal(['a', 'b', 'c'], ['a', 'b', 'c']), true)
      assert.equal(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a']), true)
      assert.equal(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a', 'c']), true)
    })
  })

  describe('product', () => {
    it('works', () => {
      assert.deepEqual(arrayOps.product([]), [])
      assert.deepEqual(arrayOps.product(['a']), [['a']])
      assert.deepEqual(arrayOps.product(['a', 'b'], ['c', 'd', 'e']), [
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
