/* eslint-env mocha */

import assert from 'assert'
import { anythingElse } from 'green-fsm'

import matchers from '../src/matchers.js'

describe('fsmify', () => {
  describe('charclass', () => {
    it('[^a]', () => {
      const nota = matchers.charclass.parse1('[^a]').fsmify([anythingElse, 'a'])

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

  describe('mult', () => {
    // Odd bug with ([bc]*c)?[ab]*
    it('odd bug', () => {
      const bcStar = matchers.mult.parse1('[bc]*')
      const int5A = bcStar.fsmify(['a', 'b', 'c', anythingElse])
      assert.strictEqual(int5A.accepts([]), true)

      const c = matchers.mult.parse1('c')
      const int5B = c.fsmify(['a', 'b', 'c', anythingElse])
      assert.strictEqual(int5B.accepts(['c']), true)
    })
  })

  describe('anchor', () => {
    it('throws', () => {
      const anchor = matchers.anchor.parse1('^')
      assert.throws(() => anchor.fsmify(), Error('Cannot make an FSM out of an anchor.'))
    })
  })
})
