/* eslint-env mocha */

import assert from 'assert'

import { upliftAnchors, deAnchorConc, deAnchorPattern } from '../src/de-anchor.js'
import matchers from '../src/matchers.js'
import serialise from '../src/serialise.js'

describe('deAnchor', () => {
  describe('upliftAnchors', () => {
    it('works', () => {
      assert.strictEqual(serialise(upliftAnchors(matchers.pattern.parse1('abc(def|ghi)jkl|mno'))), 'abc(def|ghi)jkl|mno')
      assert.strictEqual(serialise(upliftAnchors(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno'))), 'abc^$jkl|abc(def|ghi)jkl|mno')
    })

    it('handles cross products!', () => {
      assert.strictEqual(
        serialise(
          upliftAnchors(
            matchers.pattern.parse1('(^|B)($|C)|D')
          )
        ),
        '^$|^C|B$|BC|D'
      )
      assert.strictEqual(
        serialise(
          upliftAnchors(
            matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        ),
        'abc^def$jkl^mno$stu|abc^def$jklpqrstu|abcghijkl^mno$stu|abcghijklpqrstu|vwx'
      )
    })

    it('works recursively', () => {
      assert.strictEqual(serialise(upliftAnchors(matchers.pattern.parse1('aaa(((^|b)))ccc'))), 'aaa^ccc|aaabccc')
    })
  })

  describe('deAnchorConc', () => {
    it('works', () => {
      assert.strictEqual(serialise(deAnchorConc(matchers.conc.parse1('aaa^'))), '[]')
      assert.strictEqual(serialise(deAnchorConc(matchers.conc.parse1('$bbb'))), '[]')
      assert.strictEqual(serialise(deAnchorConc(matchers.conc.parse1('a{0,4}^bcd$e{0,5}'))), 'bcd')
      assert.strictEqual(serialise(deAnchorConc(matchers.conc.parse1('abc'))), '.*abc.*')
    })
  })

  describe('deAnchorPattern', () => {
    it('works on simple things', () => {
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('aaa^'))), '[]')
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('$bbb'))), '[]')
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('a{0,4}^bcd$e{0,5}'))), 'bcd')
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('abc'))), '.*abc.*')
    })

    it('works on nasty things', () => {
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('abc(def|ghi)jkl|mno'))), '.*abc(def|ghi)jkl.*|.*mno.*')
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno'))), '.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      assert.strictEqual(
        serialise(
          deAnchorPattern(
            matchers.pattern.parse1('(^|B)($|C)|D')
          )
        ),
        '|C.*|.*B|.*BC.*|.*D.*'
      )
      assert.strictEqual(
        serialise(
          deAnchorPattern(
            matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        ),
        '.*abcghijklpqrstu.*|.*vwx.*'
      )
    })

    it('works recursively', () => {
      assert.strictEqual(serialise(deAnchorPattern(matchers.pattern.parse1('aaa(((^|b)))ccc'))), '.*aaabccc.*')
    })
  })
})
