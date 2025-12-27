import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as constructors from '../src/constructors.js'

describe('matchesEmptyString', () => {
  it('works for Concs', () => {
    assert.equal(new constructors.Conc([]).matchesEmptyString(), true)
    assert.equal(new constructors.Conc([
      new constructors.Term(
        new constructors.Mult(
          new constructors.Multiplicand(
            new constructors.Charclass(['a'], false)
          ),
          new constructors.Multiplier(0, 3)
        )
      )
    ]).matchesEmptyString(), true)
    assert.equal(new constructors.Conc([
      new constructors.Term(
        new constructors.Mult(
          new constructors.Multiplicand(
            new constructors.Charclass(['a'], false)
          ),
          new constructors.Multiplier(1, 3)
        )
      )
    ]).matchesEmptyString(), false)
  })

  it('works for Patterns', () => {
    assert.equal(new constructors.Pattern([]).matchesEmptyString(), false)
    assert.equal(new constructors.Pattern([
      new constructors.Conc([])
    ]).matchesEmptyString(), true)
  })
})
