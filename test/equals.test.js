/* eslint-env mocha */

import assert from 'node:assert/strict'

import * as constructors from '../src/constructors.js'

describe('equals', () => {
  it('works', () => {
    const startAnchor = new constructors.Anchor(false)
    const endAnchor = new constructors.Anchor(true)
    assert.equal(startAnchor.equals(startAnchor), true)
    assert.equal(startAnchor.equals(endAnchor), false)
    assert.equal(endAnchor.equals(startAnchor), false)
    assert.equal(endAnchor.equals(endAnchor), true)
  })
})
