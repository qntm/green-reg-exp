/* eslint-env mocha */

import assert from 'assert'

import { upliftAnchors, deAnchorConc, deAnchorPattern } from '../src/de-anchor.js'
import matchers from '../src/matchers.js'

describe('deAnchor', () => {
  describe('upliftAnchors', () => {
    it('works', () => {
      assert.strictEqual(upliftAnchors(matchers.pattern.parse1('abc(def|ghi)jkl|mno')).serialise(), 'abc(def|ghi)jkl|mno')
      assert.strictEqual(upliftAnchors(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')).serialise(), 'abc^$jkl|abc(def|ghi)jkl|mno')
    })

    it('handles cross products!', () => {
      assert.strictEqual(
        upliftAnchors(
          matchers.pattern.parse1('(^|B)($|C)|D')
        ).serialise(),
        '^$|^C|B$|BC|D'
      )
      assert.strictEqual(
        upliftAnchors(
          matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
        ).serialise(),
        'abc^def$jkl^mno$stu|abc^def$jklpqrstu|abcghijkl^mno$stu|abcghijklpqrstu|vwx'
      )
    })

    it('works recursively', () => {
      assert.strictEqual(upliftAnchors(matchers.pattern.parse1('aaa(((^|b)))ccc')).serialise(), 'aaa^ccc|aaabccc')
    })
  })

  describe('deAnchorConc', () => {
    it('works', () => {
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('aaa^')).serialise(), '[]')
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('$bbb')).serialise(), '[]')
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('$a{0,4}^')).serialise(), '')
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('a{0,4}^bcd$e{0,5}')).serialise(), 'bcd')
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('a{0,4}$bcd^e{0,5}')).serialise(), '[]')
      assert.strictEqual(deAnchorConc(matchers.conc.parse1('abc')).serialise(), '.*abc.*')
    })
  })

  describe('deAnchorPattern', () => {
    it('works on simple things', () => {
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('aaa^')).serialise(), '[]')
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('$bbb')).serialise(), '[]')
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('a{0,4}^bcd$e{0,5}')).serialise(), 'bcd')
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('abc')).serialise(), '.*abc.*')
    })

    it('works on nasty things', () => {
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('abc(def|ghi)jkl|mno')).serialise(), '.*abc(def|ghi)jkl.*|.*mno.*')
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')).serialise(), '.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      assert.strictEqual(
        deAnchorPattern(
          matchers.pattern.parse1('(^|B)($|C)|D')
        ).serialise(),
        '|C.*|.*B|.*BC.*|.*D.*'
      )
      assert.strictEqual(
        deAnchorPattern(
          matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
        ).serialise(),
        '.*abcghijklpqrstu.*|.*vwx.*'
      )
    })

    it('works recursively', () => {
      assert.strictEqual(deAnchorPattern(matchers.pattern.parse1('aaa(((^|b)))ccc')).serialise(), '.*aaabccc.*')
    })
  })
})
