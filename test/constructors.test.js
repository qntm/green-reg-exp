// In general the idea for unit tests is that every unit test relies only on
// functionality which has already been unit-tested. If this isn't possible, then
// additional tests are required!

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as constructors from '../src/constructors.js'

describe('constructors', () => {
  it('Charclass', () => {
    assert.throws(() => new constructors.Charclass('a'), Error('`chars` must be an array'))
    assert.throws(() => new constructors.Charclass(['a']), Error('Must specify whether negated'))
    assert.throws(() => new constructors.Charclass(['aa'], false), Error('Unacceptable character aa'))
    assert.throws(() => new constructors.Charclass(['a', 'a'], false), Error('Duplicate character in charclass, a'))
  })

  it('Multiplier', () => {
    assert.throws(() => new constructors.Multiplier(-1, 1), Error('Minimum bound of a multiplier can\'t be -1'))
    assert.throws(() => new constructors.Multiplier(5, 3), Error('Invalid multiplier bounds: 5 and 3'))
  })

  it('Multiplicand', () => {
    assert.throws(() => new constructors.Multiplicand({ type: 'fish' }), Error('fish'))
  })

  it('Mult', () => {
    assert.throws(() => new constructors.Mult({ type: 'sheep' }), Error('Expected multiplicand to have type multiplicand, not sheep'))
    assert.throws(() => new constructors.Mult(new constructors.Multiplicand(new constructors.Charclass(['a'], false)), { type: 'wolf' }), Error())
  })

  it('Term', () => {
    assert.throws(() => new constructors.Term({ type: 'juice' }), Error('Bad type juice, expected Mult or Anchor'))
  })

  it('Conc', () => {
    assert.throws(() => new constructors.Conc([{ type: 'juice' }]), Error('Bad type juice, expected term'))
  })

  it('Pattern', () => {
    assert.throws(() => new constructors.Pattern(['not-a-conc']), Error('Bad type'))
  })
})
