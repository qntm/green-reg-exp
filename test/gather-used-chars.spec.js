/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'

describe('gatherUsedChars', () => {
  describe('charclass', () => {
    it('[^abc]', () => {
      const usedChars = new Set()
      matchers.charclass.parse1('[^abc]').gatherUsedChars(usedChars)
      assert.deepStrictEqual(usedChars, new Set(['a', 'b', 'c']))
    })
  })

  describe('anchor', () => {
    it('works', () => {
      const usedChars = new Set()
      matchers.anchor.parse1('^').gatherUsedChars()
      assert.deepStrictEqual(usedChars, new Set())
    })
  })
})
