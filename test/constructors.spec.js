// In general the idea for unit tests is that every unit test relies only on
// functionality which has already been unit-tested. If this isn't possible, then
// additional tests are required!

/* eslint-env mocha */

import assert from 'assert'

import * as constructors from '../src/constructors.js'

describe('constructors', () => {
  it('charclass', () => {
    assert.throws(() => constructors.charclass('a'), Error('`chars` must be an array'))
    assert.throws(() => constructors.charclass(['a']), Error('Must specify whether negated'))
    assert.throws(() => constructors.charclass(['aa'], false), Error('Unacceptable character aa'))
    assert.throws(() => constructors.charclass(['a', 'a'], false), Error('Duplicate character in charclass, a'))
  })

  it('multiplier', () => {
    assert.throws(() => constructors.multiplier(-1, 1), Error('Minimum bound of a multiplier can\'t be -1'))
    assert.throws(() => constructors.multiplier(5, 3), Error('Invalid multiplier bounds: 5 and 3'))
  })

  it('multiplicand', () => {
    assert.throws(() => constructors.multiplicand({ type: 'fish' }), Error('fish'))
  })

  it('mult', () => {
    assert.throws(() => constructors.mult({ type: 'sheep' }), Error('Expected multiplicand to have type multiplicand, not sheep'))
    assert.throws(() => constructors.mult({ type: 'multiplicand' }, { type: 'wolf' }), Error())
  })

  it('term', () => {
    assert.throws(() => constructors.term({ type: 'juice' }), Error('Bad type juice, expected mult or anchor'))
  })

  it('conc', () => {
    assert.throws(() => constructors.conc([{ type: 'juice' }]), Error('Bad type juice, expected term'))
  })

  it('pattern', () => {
    assert.throws(() => constructors.pattern(['not-a-conc']), Error('Bad type'))
  })
})
