import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as constructors from '../src/constructors.js'

describe('matchesEmptyString', () => {
  it('works', () => {
    assert.equal(new constructors.Conc([]).matchesEmptyString(), true)
  })

  it('works', () => {
    assert.equal(new constructors.Pattern([]).matchesEmptyString(), false)
  })
})
