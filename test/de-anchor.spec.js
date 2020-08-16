/* eslint-env jasmine */

'use strict'

const {upliftAnchors, deAnchorConc, deAnchorPattern} = require('../src/de-anchor')
const matchers = require('../src/matchers')
const serialise = require('../src/serialise')

describe('deAnchor', () => {
  describe('upliftAnchors', () => {
    it('works', () => {
      expect(serialise(upliftAnchors(matchers.pattern.parse1('abc(def|ghi)jkl|mno')))).toBe('abc(def|ghi)jkl|mno')
      expect(serialise(upliftAnchors(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')))).toBe('abc^$jkl|abc(def|ghi)jkl|mno')
    })

    it('handles cross products!', () => {
      expect(
        serialise(
          upliftAnchors(
            matchers.pattern.parse1('(^|B)($|C)|D')
          )
        )
      ).toBe('^$|^C|B$|BC|D')
      expect(
        serialise(
          upliftAnchors(
            matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        )
      ).toBe('abc^def$jkl^mno$stu|abc^def$jklpqrstu|abcghijkl^mno$stu|abcghijklpqrstu|vwx')
    })

    it('works recursively', () => {
      expect(serialise(upliftAnchors(matchers.pattern.parse1('aaa(((^|b)))ccc')))).toBe('aaa^ccc|aaabccc')
    })
  })

  describe('deAnchorConc', () => {
    it('works', () => {
      expect(serialise(deAnchorConc(matchers.conc.parse1('aaa^')))).toBe('[]')
      expect(serialise(deAnchorConc(matchers.conc.parse1('$bbb')))).toBe('[]')
      expect(serialise(deAnchorConc(matchers.conc.parse1('a{0,4}^bcd$e{0,5}')))).toBe('bcd')
      expect(serialise(deAnchorConc(matchers.conc.parse1('abc')))).toBe('.*abc.*')
    })
  })

  describe('deAnchorPattern', () => {
    it('works on simple things', () => {
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('aaa^')))).toBe('[]')
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('$bbb')))).toBe('[]')
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('a{0,4}^bcd$e{0,5}')))).toBe('bcd')
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('abc')))).toBe('.*abc.*')
    })

    it('works on nasty things', () => {
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('abc(def|ghi)jkl|mno')))).toBe('.*abc(def|ghi)jkl.*|.*mno.*')
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('abc(^$|def|ghi)jkl|mno')))).toBe('.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      expect(
        serialise(
          deAnchorPattern(
            matchers.pattern.parse1('(^|B)($|C)|D')
          )
        )
      ).toBe('|C.*|.*B|.*BC.*|.*D.*')
      expect(
        serialise(
          deAnchorPattern(
            matchers.pattern.parse1('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        )
      ).toBe('.*abcghijklpqrstu.*|.*vwx.*')
    })

    it('works recursively', () => {
      expect(serialise(deAnchorPattern(matchers.pattern.parse1('aaa(((^|b)))ccc')))).toBe('.*aaabccc.*')
    })
  })
})
