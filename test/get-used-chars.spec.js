/* eslint-env jasmine */

'use strict'

const matchers = require('../src/matchers.js')
const getUsedChars = require('../src/get-used-chars.js')

describe('getUsedChars', function () {
  describe('charclass', function () {
    it('[^abc]', function () {
      expect(getUsedChars(matchers.charclass.parse1('[^abc]'))).toEqual({a: true, b: true, c: true})
    })
  })
})
