/* eslint-env mocha */

import assert from 'node:assert/strict'

import { upliftAnchors, deAnchorConc, deAnchorPattern } from '../src/de-anchor.js'
import matchers from '../src/matchers.js'

describe('deAnchor', () => {
  describe('upliftAnchors', () => {
    it('works', () => {
      assert.equal(upliftAnchors(matchers.pattern.parse1('abc(def|ghi)jkl|mno')).serialise(), 'abc(def|ghi)jkl|mno')
      assert.equal(upliftAnchors(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')).serialise(), 'abc^$jkl|abc(def|ghi)jkl|mno')
    })

    it('handles cross products!', () => {
      assert.equal(
        upliftAnchors(
          matchers.pattern.parse1('(^|B)($|C)|D')
        ).serialise(),
        '^$|^C|B$|BC|D'
      )
      assert.equal(
        upliftAnchors(
          matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
        ).serialise(),
        'abc^def$jkl^mno$stu|abc^def$jklpqrstu|abcghijkl^mno$stu|abcghijklpqrstu|vwx'
      )
    })

    it('works recursively', () => {
      assert.equal(upliftAnchors(matchers.pattern.parse1('aaa(((^|b)))ccc')).serialise(), 'aaa^ccc|aaabccc')
    })
  })

  describe('deAnchorConc', () => {
    it('works', () => {
      assert.equal(deAnchorConc(matchers.conc.parse1('aaa^')).serialise(), '[]')
      assert.equal(deAnchorConc(matchers.conc.parse1('$bbb')).serialise(), '[]')
      assert.equal(deAnchorConc(matchers.conc.parse1('$a{0,4}^')).serialise(), '')
      assert.equal(deAnchorConc(matchers.conc.parse1('a{0,4}^bcd$e{0,5}')).serialise(), 'bcd')
      assert.equal(deAnchorConc(matchers.conc.parse1('a{0,4}$bcd^e{0,5}')).serialise(), '[]')
      assert.equal(deAnchorConc(matchers.conc.parse1('abc')).serialise(), '.*abc.*')
    })
  })

  describe('deAnchorPattern', () => {
    it('works on simple things', () => {
      assert.equal(deAnchorPattern(matchers.pattern.parse1('aaa^')).serialise(), '[]')
      assert.equal(deAnchorPattern(matchers.pattern.parse1('$bbb')).serialise(), '[]')
      assert.equal(deAnchorPattern(matchers.pattern.parse1('a{0,4}^bcd$e{0,5}')).serialise(), 'bcd')
      assert.equal(deAnchorPattern(matchers.pattern.parse1('abc')).serialise(), '.*abc.*')
    })

    it('works on nasty things', () => {
      assert.equal(deAnchorPattern(matchers.pattern.parse1('abc(def|ghi)jkl|mno')).serialise(), '.*abc(def|ghi)jkl.*|.*mno.*')
      assert.equal(deAnchorPattern(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')).serialise(), '.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      assert.equal(
        deAnchorPattern(
          matchers.pattern.parse1('(^|B)($|C)|D')
        ).serialise(),
        '|C.*|.*B|.*BC.*|.*D.*'
      )
      assert.equal(
        deAnchorPattern(
          matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
        ).serialise(),
        '.*abcghijklpqrstu.*|.*vwx.*'
      )
    })

    it('works recursively', () => {
      assert.equal(deAnchorPattern(matchers.pattern.parse1('aaa(((^|b)))ccc')).serialise(), '.*aaabccc.*')
    })
  })
})
