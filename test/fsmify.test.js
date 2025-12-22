/* eslint-env mocha */

import assert from 'node:assert/strict'

import { anythingElse } from 'green-fsm'

import matchers from '../src/matchers.js'

describe('fsmify', () => {
  describe('charclass', () => {
    it('[^a]', () => {
      const nota = matchers.charclass.parse1('[^a]').fsmify([anythingElse, 'a'])

      assert.equal(nota.accepts([]), false)
      assert.equal(nota.accepts(['a']), false)
      assert.equal(nota.accepts(['b']), true)
      assert.equal(nota.accepts([anythingElse]), true)
      assert.equal(nota.accepts(['c']), true)
      assert.equal(nota.accepts([{}]), true)
      assert.equal(nota.accepts([4358375923]), true)
      assert.equal(nota.accepts(['b', 'b']), false)
    })
  })

  describe('mult', () => {
    // Odd bug with ([bc]*c)?[ab]*
    it('odd bug', () => {
      const bcStar = matchers.mult.parse1('[bc]*')
      const int5A = bcStar.fsmify(['a', 'b', 'c', anythingElse])
      assert.equal(int5A.accepts([]), true)

      const c = matchers.mult.parse1('c')
      const int5B = c.fsmify(['a', 'b', 'c', anythingElse])
      assert.equal(int5B.accepts(['c']), true)
    })
  })

  describe('anchor', () => {
    it('throws', () => {
      const anchor = matchers.anchor.parse1('^')
      assert.throws(() => anchor.fsmify(), Error('Cannot make an FSM out of an anchor.'))
    })
  })
})
