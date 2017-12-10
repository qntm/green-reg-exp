/* eslint-env jasmine */

'use strict'

const constructors = require('../src/constructors.js')
const matchers = require('../src/matchers.js')

describe('matchers', function () {
  describe('charclass', function () {
    it('works', function () {
      expect(matchers.charclass('a', 0).next().value).toEqual({
        j: 1,
        match: constructors.charclass(['a'], false)
      })
    })
  })

  describe('mult', function () {
    it('works', function () {
      const iterator = matchers.mult('abcde[^fg]*', 5)
      expect(iterator.next().value).toEqual({
        j: 10,
        match: constructors.mult(
          constructors.multiplicand(constructors.charclass(['f', 'g'], true)),
          constructors.multiplier(1, 1)
        )
      })
      expect(iterator.next().value).toEqual({
        j: 11,
        match: constructors.mult(
          constructors.multiplicand(constructors.charclass(['f', 'g'], true)),
          constructors.multiplier(0, Infinity)
        )
      })
    })

    it('works too', () => {
      const iterator = matchers.mult('abcde[^fg]*h{5}[a-z]+', 11)
      expect(iterator.next().value).toEqual({
        j: 12,
        match: constructors.mult(
          constructors.multiplicand(constructors.charclass(['h'], false)),
          constructors.multiplier(1, 1)
        )
      })
      expect(iterator.next().value).toEqual({
        j: 15,
        match: constructors.mult(
          constructors.multiplicand(constructors.charclass(['h'], false)),
          constructors.multiplier(5, 5)
        )
      })
    })

    it('works three', () => {
      const iterator = matchers.mult('abcde[^fg]*h{5}[a-z]+T{1,}', 15)
      expect(iterator.next().value).toEqual({
        j: 20,
        match: constructors.mult(
          constructors.multiplicand(
            constructors.charclass([
              'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
              'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
              'u', 'v', 'w', 'x', 'y', 'z'
            ], false)
          ),
          constructors.multiplier(1, 1)
        )
      })
      expect(iterator.next().value).toEqual({
        j: 21,
        match: constructors.mult(
          constructors.multiplicand(
            constructors.charclass([
              'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
              'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
              'u', 'v', 'w', 'x', 'y', 'z'
            ], false)
          ),
          constructors.multiplier(1, Infinity)
        )
      })
    })

    it('works four', () => {
      const iterator = matchers.mult('abcde[^fg]*h{5}[a-z]+T{2,}', 21)
      expect(iterator.next().value).toEqual({
        j: 22,
        match: constructors.mult(
          constructors.multiplicand(
            constructors.charclass(['T'], false)
          ),
          constructors.multiplier(1, 1)
        )
      })
      expect(iterator.next().value).toEqual({
        j: 26,
        match: constructors.mult(
          constructors.multiplicand(
            constructors.charclass(['T'], false)
          ),
          constructors.multiplier(2, Infinity)
        )
      })
    })
  })
})
