/* eslint-env mocha */

import assert from 'node:assert/strict'

import matchers from '../src/matchers.js'

describe('gatherUsedChars', () => {
  describe('charclass', () => {
    it('[^abc]', () => {
      const usedChars = new Set()
      matchers.charclass.parse1('[^abc]').gatherUsedChars(usedChars)
      assert.deepEqual(usedChars, new Set(['a', 'b', 'c']))
    })
  })

  describe('anchor', () => {
    it('works', () => {
      const usedChars = new Set()
      matchers.anchor.parse1('^').gatherUsedChars()
      assert.deepEqual(usedChars, new Set())
    })
  })
})
