/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'

describe('getUsedChars', () => {
  describe('charclass', () => {
    it('[^abc]', () => {
      assert.deepStrictEqual(matchers.charclass.parse1('[^abc]').getUsedChars(), {
        a: true,
        b: true,
        c: true
      })
    })
  })

  describe('anchor', () => {
    it('works', () => {
      assert.deepStrictEqual(matchers.anchor.parse1('^').getUsedChars(), {})
    })
  })
})
