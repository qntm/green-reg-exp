/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'
import { getUsedChars } from '../src/get-used-chars.js'

describe('getUsedChars', () => {
  describe('charclass', () => {
    it('[^abc]', () => {
      assert.deepStrictEqual(getUsedChars(matchers.charclass.parse1('[^abc]')), {
        a: true,
        b: true,
        c: true
      })
    })
  })

  describe('anchor', () => {
    it('works', () => {
      assert.deepStrictEqual(getUsedChars(matchers.anchor.parse1('^')), {})
    })
  })
})
