/* eslint-env mocha */

import assert from 'node:assert/strict'

import * as greenRegExp from '../src/green-reg-exp.js'

describe('greenRegExp', () => {
  describe('parse', () => {
    describe('accepts', () => {
      it('works', () => {
        assert.equal(greenRegExp.parse('a.b').accepts('acb'), true)

        const bad = greenRegExp.parse('0{2}|1{2}')
        assert.equal(bad.accepts('00'), true)
        assert.equal(bad.accepts('11'), true)
        assert.equal(bad.accepts('01'), false)
      })

      it('bug #28', () => {
        // Starification was broken in FSMs
        assert.equal(greenRegExp.parse('ab*').accepts('a'), true)
        assert.equal(greenRegExp.parse('ab*').accepts('b'), false)
        assert.equal(greenRegExp.parse('(ab*)*').accepts('aab'), true)
        assert.equal(greenRegExp.parse('(ab*)*').accepts('bb'), false)
      })

      it('block comment', () => {
        // I went through several incorrect regexes for C block comments. Here we show
        // why the first few attempts were incorrect
        const a = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*/')
        assert.equal(a.accepts('/**/'), true)
        assert.equal(a.accepts('/***/'), false)
        assert.equal(a.accepts('/****/'), false)

        const b = greenRegExp.parse('/\\*(([^*]|\\*[^/])*)\\*/')
        assert.equal(b.accepts('/**/'), true)
        assert.equal(b.accepts('/***/'), false)
        assert.equal(b.accepts('/****/'), true)

        const c = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*+/')
        assert.equal(c.accepts('/**/'), true)
        assert.equal(c.accepts('/***/'), true)
        assert.equal(c.accepts('/****/'), true)
      })

      it('pattern', () => {
        // "a[^a]"
        const anota = greenRegExp.parse('a[^a]')
        assert.equal(anota.accepts('a'), false)
        assert.equal(anota.accepts('b'), false)
        assert.equal(anota.accepts('aa'), false)
        assert.equal(anota.accepts('ab'), true)
        assert.equal(anota.accepts('ba'), false)
        assert.equal(anota.accepts('bb'), false)

        // "0\\d"
        const zeroD = greenRegExp.parse('0\\d')
        assert.equal(zeroD.accepts('01'), true)
        assert.equal(zeroD.accepts('10'), false)

        // "\\d{2}"
        const d2 = greenRegExp.parse('\\d{2}')
        assert.equal(d2.accepts(''), false)
        assert.equal(d2.accepts('1'), false)
        assert.equal(d2.accepts('11'), true)
        assert.equal(d2.accepts('111'), false)

        // abc|def(ghi|jkl)
        const conventional = greenRegExp.parse('abc|def(ghi|jkl)')
        assert.equal(conventional.accepts('a'), false)
        assert.equal(conventional.accepts('ab'), false)
        assert.equal(conventional.accepts('abc'), true)
        assert.equal(conventional.accepts('abcj'), false)
        assert.equal(conventional.accepts('defghi'), true)
        assert.equal(conventional.accepts('defjkl'), true)
      })
    })

    describe('strings', () => {
      it('mult', () => {
        // One term
        const gen1 = greenRegExp.parse('[ab]').strings('c')
        assert.equal(gen1.next().value, 'a')
        assert.equal(gen1.next().value, 'b')
        assert.equal(gen1.next().done, true)

        // No terms
        const gen0 = greenRegExp.parse('[ab]{0}').strings('c')
        assert.equal(gen0.next().value, '')
        assert.equal(gen0.next().done, true)

        // Many terms
        const genStar = greenRegExp.parse('[ab]*').strings('c')
        assert.equal(genStar.next().value, '')
        assert.equal(genStar.next().value, 'a')
        assert.equal(genStar.next().value, 'b')
        assert.equal(genStar.next().value, 'aa')
        assert.equal(genStar.next().value, 'ab')
        assert.equal(genStar.next().value, 'ba')
        assert.equal(genStar.next().value, 'bb')
        assert.equal(genStar.next().value, 'aaa')
      })

      it('infinite generation', () => {
        // Infinite generator, flummoxes both depth-first and breadth-first searches
        const gen = greenRegExp.parse('a*b*').strings('c')
        assert.equal(gen.next().value, '')
        assert.equal(gen.next().value, 'a')
        assert.equal(gen.next().value, 'b')
        assert.equal(gen.next().value, 'aa')
        assert.equal(gen.next().value, 'ab')
        assert.equal(gen.next().value, 'bb')
        assert.equal(gen.next().value, 'aaa')
        assert.equal(gen.next().value, 'aab')
        assert.equal(gen.next().value, 'abb')
        assert.equal(gen.next().value, 'bbb')
        assert.equal(gen.next().value, 'aaaa')
      })

      it('wildcards', () => {
        // Generator needs to handle wildcards as well. Wildcards come last.
        const gen = greenRegExp.parse('a.b').strings('c')
        assert.equal(gen.next().value, 'aab')
        assert.equal(gen.next().value, 'abb')
        assert.equal(gen.next().value, 'acb')
        assert.equal(gen.next().done, true)
      })

      it('pattern generators', () => {
        const genAbcde = greenRegExp.parse('[ab]|[cde]').strings('f')
        assert.equal(genAbcde.next().value, 'a')
        assert.equal(genAbcde.next().value, 'b')
        assert.equal(genAbcde.next().value, 'c')
        assert.equal(genAbcde.next().value, 'd')
        assert.equal(genAbcde.next().value, 'e')
        assert.equal(genAbcde.next().done, true)

        // more complex
        const gen3 = greenRegExp.parse('abc|def(ghi|jkl)').strings('m')
        assert.equal(gen3.next().value, 'abc')
        assert.equal(gen3.next().value, 'defghi')
        assert.equal(gen3.next().value, 'defjkl')
        assert.equal(gen3.next().done, true)

        const genNum = greenRegExp.parse('[0-9A-F]{3,10}').strings('_')
        assert.equal(genNum.next().value, '000')
        assert.equal(genNum.next().value, '001')
        assert.equal(genNum.next().value, '002')
      })
    })
  })

  describe('intersection', () => {
    it('easy mode', () => {
      assert.equal(greenRegExp.intersection('abc...', '...def'), 'abcdef')
    })

    // These three collectively take too long!
    describe('dates', () => {
      it('dates 1', () => {
        assert.equal(greenRegExp.intersection('[01][01]00', '00.*'), '0000')
      })

      it('dates 2', () => {
        assert.equal(greenRegExp.intersection('[01][01]00-00-00', '00.*'), '0000-00-00')
      })

      it('dates 3', () => {
        assert.equal(greenRegExp.intersection('\\d{4}-\\d{2}-\\d{2}', '19.*'), '19\\d\\d-\\d\\d-\\d\\d')
      })
    })

    xit('symbols', () => {
      assert.equal(greenRegExp.intersection('\\W*', '[a-g0-8$%\\^]+', '[^d]{2,8}'), '[$%\\^]{2,8}')
    })

    // need more reduction rules before this will work
    xit('complex stars', () => {
      const intersection = greenRegExp.intersection('[bc]*[ab]*', '[ab]*[bc]*')
      assert.equal(intersection, '([ab]*a|[bc]*c)?b*')
    })

    it('epsilon intersection', () => {
      assert.equal(greenRegExp.intersection('a*', 'b*'), '')
    })

    it('null intersection', () => {
      assert.equal(greenRegExp.intersection('a', 'b'), '[]')
    })
  })

  describe('deAnchor', () => {
    it('works on simple things', () => {
      assert.equal(greenRegExp.deAnchor('aaa^'), '[]')
      assert.equal(greenRegExp.deAnchor('$bbb'), '[]')
      assert.equal(greenRegExp.deAnchor('a{0,4}^bcd$e{0,5}'), 'bcd')
      assert.equal(greenRegExp.deAnchor('abc'), '.*abc.*')
    })

    it('works on nasty things', () => {
      assert.equal(greenRegExp.deAnchor('abc(def|ghi)jkl|mno'), '.*abc(def|ghi)jkl.*|.*mno.*')
      assert.equal(greenRegExp.deAnchor('abc(^$|def|ghi)jkl|mno'), '.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      assert.equal(greenRegExp.deAnchor('(^|B)($|C)|D'), '|C.*|.*B|.*BC.*|.*D.*')
      assert.equal(greenRegExp.deAnchor('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx'), '.*abcghijklpqrstu.*|.*vwx.*')
    })

    it('works recursively', () => {
      assert.equal(greenRegExp.deAnchor('aaa(((^|b)))ccc'), '.*aaabccc.*')
    })
  })

  describe('reduce', () => {
    it('works', () => {
      assert.equal(greenRegExp.reduce('a|b|c|d'), '[a-d]')
    })
  })
})
