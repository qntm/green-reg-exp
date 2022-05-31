/* eslint-env mocha */

import assert from 'assert'

import greenRegExp from '../src/green-reg-exp.js'

describe('greenRegExp', function () {
  describe('parse', () => {
    describe('accepts', function () {
      it('works', function () {
        assert.strictEqual(greenRegExp.parse('a.b').accepts('acb'), true)

        const bad = greenRegExp.parse('0{2}|1{2}')
        assert.strictEqual(bad.accepts('00'), true)
        assert.strictEqual(bad.accepts('11'), true)
        assert.strictEqual(bad.accepts('01'), false)
      })

      it('bug #28', function () {
        // Starification was broken in FSMs
        assert.strictEqual(greenRegExp.parse('ab*').accepts('a'), true)
        assert.strictEqual(greenRegExp.parse('ab*').accepts('b'), false)
        assert.strictEqual(greenRegExp.parse('(ab*)*').accepts('aab'), true)
        assert.strictEqual(greenRegExp.parse('(ab*)*').accepts('bb'), false)
      })

      it('block comment', function () {
        // I went through several incorrect regexes for C block comments. Here we show
        // why the first few attempts were incorrect
        const a = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*/')
        assert.strictEqual(a.accepts('/**/'), true)
        assert.strictEqual(a.accepts('/***/'), false)
        assert.strictEqual(a.accepts('/****/'), false)

        const b = greenRegExp.parse('/\\*(([^*]|\\*[^/])*)\\*/')
        assert.strictEqual(b.accepts('/**/'), true)
        assert.strictEqual(b.accepts('/***/'), false)
        assert.strictEqual(b.accepts('/****/'), true)

        const c = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*+/')
        assert.strictEqual(c.accepts('/**/'), true)
        assert.strictEqual(c.accepts('/***/'), true)
        assert.strictEqual(c.accepts('/****/'), true)
      })

      it('pattern', function () {
        // "a[^a]"
        const anota = greenRegExp.parse('a[^a]')
        assert.strictEqual(anota.accepts('a'), false)
        assert.strictEqual(anota.accepts('b'), false)
        assert.strictEqual(anota.accepts('aa'), false)
        assert.strictEqual(anota.accepts('ab'), true)
        assert.strictEqual(anota.accepts('ba'), false)
        assert.strictEqual(anota.accepts('bb'), false)

        // "0\\d"
        const zeroD = greenRegExp.parse('0\\d')
        assert.strictEqual(zeroD.accepts('01'), true)
        assert.strictEqual(zeroD.accepts('10'), false)

        // "\\d{2}"
        const d2 = greenRegExp.parse('\\d{2}')
        assert.strictEqual(d2.accepts(''), false)
        assert.strictEqual(d2.accepts('1'), false)
        assert.strictEqual(d2.accepts('11'), true)
        assert.strictEqual(d2.accepts('111'), false)

        // abc|def(ghi|jkl)
        const conventional = greenRegExp.parse('abc|def(ghi|jkl)')
        assert.strictEqual(conventional.accepts('a'), false)
        assert.strictEqual(conventional.accepts('ab'), false)
        assert.strictEqual(conventional.accepts('abc'), true)
        assert.strictEqual(conventional.accepts('abcj'), false)
        assert.strictEqual(conventional.accepts('defghi'), true)
        assert.strictEqual(conventional.accepts('defjkl'), true)
      })
    })

    describe('strings', function () {
      it('mult', function () {
        // One term
        const gen1 = greenRegExp.parse('[ab]').strings('c')
        assert.strictEqual(gen1.next().value, 'a')
        assert.strictEqual(gen1.next().value, 'b')
        assert.strictEqual(gen1.next().done, true)

        // No terms
        const gen0 = greenRegExp.parse('[ab]{0}').strings('c')
        assert.strictEqual(gen0.next().value, '')
        assert.strictEqual(gen0.next().done, true)

        // Many terms
        const genStar = greenRegExp.parse('[ab]*').strings('c')
        assert.strictEqual(genStar.next().value, '')
        assert.strictEqual(genStar.next().value, 'a')
        assert.strictEqual(genStar.next().value, 'b')
        assert.strictEqual(genStar.next().value, 'aa')
        assert.strictEqual(genStar.next().value, 'ab')
        assert.strictEqual(genStar.next().value, 'ba')
        assert.strictEqual(genStar.next().value, 'bb')
        assert.strictEqual(genStar.next().value, 'aaa')
      })

      it('infinite generation', function () {
        // Infinite generator, flummoxes both depth-first and breadth-first searches
        const gen = greenRegExp.parse('a*b*').strings('c')
        assert.strictEqual(gen.next().value, '')
        assert.strictEqual(gen.next().value, 'a')
        assert.strictEqual(gen.next().value, 'b')
        assert.strictEqual(gen.next().value, 'aa')
        assert.strictEqual(gen.next().value, 'ab')
        assert.strictEqual(gen.next().value, 'bb')
        assert.strictEqual(gen.next().value, 'aaa')
        assert.strictEqual(gen.next().value, 'aab')
        assert.strictEqual(gen.next().value, 'abb')
        assert.strictEqual(gen.next().value, 'bbb')
        assert.strictEqual(gen.next().value, 'aaaa')
      })

      it('wildcards', function () {
        // Generator needs to handle wildcards as well. Wildcards come last.
        const gen = greenRegExp.parse('a.b').strings('c')
        assert.strictEqual(gen.next().value, 'aab')
        assert.strictEqual(gen.next().value, 'abb')
        assert.strictEqual(gen.next().value, 'acb')
        assert.strictEqual(gen.next().done, true)
      })

      it('pattern generators', function () {
        const genAbcde = greenRegExp.parse('[ab]|[cde]').strings('f')
        assert.strictEqual(genAbcde.next().value, 'a')
        assert.strictEqual(genAbcde.next().value, 'b')
        assert.strictEqual(genAbcde.next().value, 'c')
        assert.strictEqual(genAbcde.next().value, 'd')
        assert.strictEqual(genAbcde.next().value, 'e')
        assert.strictEqual(genAbcde.next().done, true)

        // more complex
        const gen3 = greenRegExp.parse('abc|def(ghi|jkl)').strings('m')
        assert.strictEqual(gen3.next().value, 'abc')
        assert.strictEqual(gen3.next().value, 'defghi')
        assert.strictEqual(gen3.next().value, 'defjkl')
        assert.strictEqual(gen3.next().done, true)

        const genNum = greenRegExp.parse('[0-9A-F]{3,10}').strings('_')
        assert.strictEqual(genNum.next().value, '000')
        assert.strictEqual(genNum.next().value, '001')
        assert.strictEqual(genNum.next().value, '002')
      })
    })
  })

  describe('intersection', () => {
    it('easy mode', () => {
      assert.strictEqual(greenRegExp.intersection('abc...', '...def'), 'abcdef')
    })

    it('dates', () => {
      assert.strictEqual(greenRegExp.intersection('[01][01]00', '00.*'), '0000')
      assert.strictEqual(greenRegExp.intersection('[01][01]00-00-00', '00.*'), '0000-00-00')
      assert.strictEqual(greenRegExp.intersection('\\d{4}-\\d{2}-\\d{2}', '19.*'), '19\\d\\d-\\d\\d-\\d\\d')
    })

    xit('symbols', () => {
      assert.strictEqual(greenRegExp.intersection('\\W*', '[a-g0-8$%\\^]+', '[^d]{2,8}'), '[$%\\^]{2,8}')
    })

    // need more reduction rules before this will work
    xit('complex stars', () => {
      const intersection = greenRegExp.intersection('[bc]*[ab]*', '[ab]*[bc]*')
      assert.strictEqual(intersection, '([ab]*a|[bc]*c)?b*')
    })

    it('epsilon intersection', () => {
      assert.strictEqual(greenRegExp.intersection('a*', 'b*'), '')
    })

    it('null intersection', () => {
      assert.strictEqual(greenRegExp.intersection('a', 'b'), '[]')
    })
  })

  describe('deAnchor', () => {
    it('works on simple things', () => {
      assert.strictEqual(greenRegExp.deAnchor('aaa^'), '[]')
      assert.strictEqual(greenRegExp.deAnchor('$bbb'), '[]')
      assert.strictEqual(greenRegExp.deAnchor('a{0,4}^bcd$e{0,5}'), 'bcd')
      assert.strictEqual(greenRegExp.deAnchor('abc'), '.*abc.*')
    })

    it('works on nasty things', () => {
      assert.strictEqual(greenRegExp.deAnchor('abc(def|ghi)jkl|mno'), '.*abc(def|ghi)jkl.*|.*mno.*')
      assert.strictEqual(greenRegExp.deAnchor('abc(^$|def|ghi)jkl|mno'), '.*abc(def|ghi)jkl.*|.*mno.*')
    })

    it('handles cross products!', () => {
      assert.strictEqual(greenRegExp.deAnchor('(^|B)($|C)|D'), '|C.*|.*B|.*BC.*|.*D.*')
      assert.strictEqual(greenRegExp.deAnchor('abc(^def$|ghi)jkl(^mno$|pqr)stu|vwx'), '.*abcghijklpqrstu.*|.*vwx.*')
    })

    it('works recursively', () => {
      assert.strictEqual(greenRegExp.deAnchor('aaa(((^|b)))ccc'), '.*aaabccc.*')
    })
  })

  describe('reduce', () => {
    it('works', () => {
      assert.strictEqual(greenRegExp.reduce('a|b|c|d'), '[a-d]')
    })
  })
})
