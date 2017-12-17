/* eslint-env jasmine */

'use strict'

const arrayOps = require('../src/array-ops')

describe('arrayOps', () => {
  describe('and', () => {
    it('works', () => {
      expect(arrayOps.and([], [])).toEqual([])
      expect(arrayOps.and(['a', 'b', 'c'], [])).toEqual([])
      expect(arrayOps.and(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['b', 'c'])
      expect(arrayOps.and(['a', 'b', 'c'], ['c', 'b', 'a'])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('or', () => {
    it('works', () => {
      expect(arrayOps.or([], [])).toEqual([])
      expect(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
      expect(arrayOps.or(['a', 'b', 'c'], ['a', 'b', 'd'])).toEqual(['a', 'b', 'c', 'd'])
    })
  })

  describe('minus', () => {
    it('works', () => {
      expect(arrayOps.minus(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c'])
      expect(arrayOps.minus(['a', 'b', 'c'], ['c', 'd', 'e'])).toEqual(['a', 'b'])
    })
  })

  describe('equal', () => {
    it('works', () => {
      expect(arrayOps.equal(['a', 'b', 'c'], ['a', 'b'])).toBe(false)
      expect(arrayOps.equal(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true)
      expect(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(true)
      expect(arrayOps.equal(['a', 'b', 'c'], ['c', 'b', 'a', 'c'])).toBe(true)
    })
  })

  describe('product', () => {
    it('works', () => {
      expect(arrayOps.product([])).toEqual([])
      expect(arrayOps.product(['a'])).toEqual([['a']])
      expect(arrayOps.product(['a', 'b'], ['c', 'd', 'e'])).toEqual([
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
