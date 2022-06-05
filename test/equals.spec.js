/* eslint-env mocha */

import assert from 'assert'

import { equals } from '../src/equals.js'
import * as constructors from '../src/constructors.js'

describe('equals', () => {
  it('works', () => {
    const startAnchor = new constructors.Anchor(false)
    const endAnchor = new constructors.Anchor(true)
    assert.strictEqual(equals(startAnchor, startAnchor), true)
    assert.strictEqual(equals(startAnchor, endAnchor), false)
    assert.strictEqual(equals(endAnchor, startAnchor), false)
    assert.strictEqual(equals(endAnchor, endAnchor), true)
  })
})
