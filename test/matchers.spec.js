/* eslint-env mocha */

import assert from 'assert'

import * as constructors from '../src/constructors.js'
import matchers from '../src/matchers.js'

describe('matchers', () => {
  describe('charclass', () => {
    it('works', () => {
      assert.deepStrictEqual(matchers.charclass.match('a', 0).next().value, {
        j: 1,
        match: new constructors.Charclass(['a'], false)
      })
    })

    it('throws', () => {
      assert.throws(() => matchers.charclass.match('[d-d]', 0).next(), Error("Range 'd-d' not allowed"))
    })
  })

  describe('mult', () => {
    it('works', () => {
      const iterator = matchers.mult.match('abcde[^fg]*', 5)
      assert.deepStrictEqual(iterator.next().value, {
        j: 10,
        match: constructors.mult(
          constructors.multiplicand(new constructors.Charclass(['f', 'g'], true)),
          constructors.multiplier(1, 1)
        )
      })
      assert.deepStrictEqual(iterator.next().value, {
        j: 11,
        match: constructors.mult(
          constructors.multiplicand(new constructors.Charclass(['f', 'g'], true)),
          constructors.multiplier(0, Infinity)
        )
      })
    })

    it('works too', () => {
      const iterator = matchers.mult.match('abcde[^fg]*h{5}[a-z]+', 11)
      assert.deepStrictEqual(iterator.next().value, {
        j: 12,
        match: constructors.mult(
          constructors.multiplicand(new constructors.Charclass(['h'], false)),
          constructors.multiplier(1, 1)
        )
      })
      assert.deepStrictEqual(iterator.next().value, {
        j: 15,
        match: constructors.mult(
          constructors.multiplicand(new constructors.Charclass(['h'], false)),
          constructors.multiplier(5, 5)
        )
      })
    })

    it('works three', () => {
      const iterator = matchers.mult.match('abcde[^fg]*h{5}[a-z]+T{1,}', 15)
      assert.deepStrictEqual(iterator.next().value, {
        j: 20,
        match: constructors.mult(
          constructors.multiplicand(
            new constructors.Charclass([
              'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
              'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
              'u', 'v', 'w', 'x', 'y', 'z'
            ], false)
          ),
          constructors.multiplier(1, 1)
        )
      })
      assert.deepStrictEqual(iterator.next().value, {
        j: 21,
        match: constructors.mult(
          constructors.multiplicand(
            new constructors.Charclass([
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
      const iterator = matchers.mult.match('abcde[^fg]*h{5}[a-z]+T{2,}', 21)
      assert.deepStrictEqual(iterator.next().value, {
        j: 22,
        match: constructors.mult(
          constructors.multiplicand(
            new constructors.Charclass(['T'], false)
          ),
          constructors.multiplier(1, 1)
        )
      })
      assert.deepStrictEqual(iterator.next().value, {
        j: 26,
        match: constructors.mult(
          constructors.multiplicand(
            new constructors.Charclass(['T'], false)
          ),
          constructors.multiplier(2, Infinity)
        )
      })
    })
  })
})
