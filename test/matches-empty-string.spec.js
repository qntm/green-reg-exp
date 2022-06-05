/* eslint-env mocha */

import assert from 'assert'

import * as constructors from '../src/constructors.js'

describe('matchesEmptyString', () => {
  it('works', () => {
    assert.strictEqual(new constructors.Conc([]).matchesEmptyString(), true)
  })

  it('works', () => {
    assert.strictEqual(new constructors.Pattern([]).matchesEmptyString(), false)
  })
})
