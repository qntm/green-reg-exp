/* eslint-env jasmine */

'use strict'

const monoParsers = require('../src/mono-parsers.js')
const usedCharGetters = require('../src/used-char-getters.js')

describe('usedCharGetters', function () {
  describe('charclass', function () {
    it('[^abc]', function () {
      expect(usedCharGetters.charclass(monoParsers.charclass('[^abc]'))).toEqual({a: true, b: true, c: true})
    })
  })
})
