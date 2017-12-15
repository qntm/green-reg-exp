/* eslint-env jasmine */

'use strict'

const monoParsers = require('../src/mono-parsers.js')
const getUsedChars = require('../src/get-used-chars.js')

describe('getUsedChars', function () {
  describe('charclass', function () {
    it('[^abc]', function () {
      expect(getUsedChars(monoParsers.charclass('[^abc]'))).toEqual({a: true, b: true, c: true})
    })
  })
})
