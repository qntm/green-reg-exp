/* eslint-env mocha */

import assert from 'assert'

import matchers from '../src/matchers.js'
import { getUsedChars } from '../src/get-used-chars.js'

describe('getUsedChars', function () {
  describe('charclass', function () {
    it('[^abc]', function () {
      assert.deepStrictEqual(getUsedChars(matchers.charclass.parse1('[^abc]')), {
        a: true,
        b: true,
        c: true
      })
    })
  })
})
