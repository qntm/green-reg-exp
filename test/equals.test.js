/* eslint-env mocha */

import assert from 'assert'

import * as constructors from '../src/constructors.js'

describe('equals', () => {
  it('works', () => {
    const startAnchor = new constructors.Anchor(false)
    const endAnchor = new constructors.Anchor(true)
    assert.strictEqual(startAnchor.equals(startAnchor), true)
    assert.strictEqual(startAnchor.equals(endAnchor), false)
    assert.strictEqual(endAnchor.equals(startAnchor), false)
    assert.strictEqual(endAnchor.equals(endAnchor), true)
  })
})
