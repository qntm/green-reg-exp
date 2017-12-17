/* eslint-env jasmine */

'use strict'

const {upliftAnchors, deAnchorConc, deAnchorPattern} = require('../src/de-anchor')
const monoParsers = require('../src/mono-parsers')
const serialise = require('../src/serialise')

describe('deAnchor', () => {
  describe('upliftAnchors', () => {
    it('works', () => {
      expect(serialise(upliftAnchors(monoParsers.pattern('abc(def|ghi)jkl|mno')))).toBe('abc(def|ghi)jkl|mno')
      expect(serialise(upliftAnchors(monoParsers.pattern('abc(^$|def|ghi)jkl|mno')))).toBe('abc^$jkl|abc(def|ghi)jkl|mno')
    })

    it('handles cross products!', () => {
      expect(
        serialise(
          upliftAnchors(
            monoParsers.pattern('(^|B)($|C)|D')
          )
        )
      ).toBe('^$|^C|B$|BC|D')
      expect(
        serialise(
          upliftAnchors(
            monoParsers.pattern('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        )
      ).toBe('abc^def$jkl^mno$stu|abc^def$jklpqrstu|abcghijkl^mno$stu|abcghijklpqrstu|vwx')
    })

    it('works recursively', () => {
      expect(serialise(upliftAnchors(monoParsers.pattern('aaa(((^|b)))ccc')))).toBe('aaa^ccc|aaabccc')
    })
  })

  describe('deAnchorConc', () => {
    it('works', () => {
      expect(serialise(deAnchorConc(monoParsers.conc('aaa^')))).toBe('[]')
      expect(serialise(deAnchorConc(monoParsers.conc('$bbb')))).toBe('[]')
      expect(serialise(deAnchorConc(monoParsers.conc('a{0,4}^bcd$e{0,5}')))).toBe('bcd')
      expect(serialise(deAnchorConc(monoParsers.conc('abc')))).toBe('.*abc.*')
    })
  })

  describe('deAnchorPattern', () => {
    it('works on simple things', () => {
      expect(serialise(deAnchorPattern(monoParsers.pattern('aaa^')))).toBe('[]')
      expect(serialise(deAnchorPattern(monoParsers.pattern('$bbb')))).toBe('[]')
      expect(serialise(deAnchorPattern(monoParsers.pattern('a{0,4}^bcd$e{0,5}')))).toBe('bcd')
      expect(serialise(deAnchorPattern(monoParsers.pattern('abc')))).toBe('.*abc.*')
    })

    it('works on nasty things', () => {
      expect(serialise(deAnchorPattern(monoParsers.pattern('abc(def|ghi)jkl|mno')))).toBe('.*abc(def|ghi)jkl.*|.*mno.*')
      expect(serialise(deAnchorPattern(monoParsers.pattern('abc(^$|def|ghi)jkl|mno')))).toBe('.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      expect(
        serialise(
          deAnchorPattern(
            monoParsers.pattern('(^|B)($|C)|D')
          )
        )
      ).toBe('|C.*|.*B|.*BC.*|.*D.*')
      expect(
        serialise(
          deAnchorPattern(
            monoParsers.pattern('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx')
          )
        )
      ).toBe('.*abcghijklpqrstu.*|.*vwx.*')
    })

    it('works recursively', () => {
      expect(serialise(deAnchorPattern(monoParsers.pattern('aaa(((^|b)))ccc')))).toBe('.*aaabccc.*')
    })
  })
})
