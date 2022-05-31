/* eslint-env mocha */

import assert from 'assert'
import { anythingElse } from 'green-fsm'

import matchers from '../src/matchers.js'
import fsmify from '../src/fsmify.js'

describe('fsmify', function () {
  describe('charclass', function () {
    it('[^a]', function () {
      const nota = fsmify(matchers.charclass.parse1('[^a]'), [anythingElse, 'a'])

      assert.strictEqual(nota.accepts([]), false)
      assert.strictEqual(nota.accepts(['a']), false)
      assert.strictEqual(nota.accepts(['b']), true)
      assert.strictEqual(nota.accepts([anythingElse]), true)
      assert.strictEqual(nota.accepts(['c']), true)
      assert.strictEqual(nota.accepts([{}]), true)
      assert.strictEqual(nota.accepts([4358375923]), true)
      assert.strictEqual(nota.accepts(['b', 'b']), false)
    })
  })

  describe('mult', function () {
    // Odd bug with ([bc]*c)?[ab]*
    it('odd bug', function () {
      const bcStar = matchers.mult.parse1('[bc]*')
      const int5A = fsmify(bcStar, ['a', 'b', 'c', anythingElse])
      assert.strictEqual(int5A.accepts([]), true)

      const c = matchers.mult.parse1('c')
      const int5B = fsmify(c, ['a', 'b', 'c', anythingElse])
      assert.strictEqual(int5B.accepts(['c']), true)
    })
  })
})
