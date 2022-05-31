/* eslint-env mocha */

import assert from 'assert'

import { matchesEmptyString } from '../src/matches-empty-string.js'
import * as constructors from '../src/constructors.js'

describe('matchesEmptyString', () => {
  it('works', () => {
    assert.strictEqual(matchesEmptyString(constructors.pattern([])), false)
  })
})
