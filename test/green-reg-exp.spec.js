/* eslint-env jasmine */

'use strict'

const greenRegExp = require('../src/green-reg-exp.js')

describe('greenRegExp', function () {
  describe('parse', () => {
    describe('accepts', function () {
      it('works', function () {
        expect(greenRegExp.parse('a.b').accepts('acb')).toBe(true)

        var bad = greenRegExp.parse('0{2}|1{2}')
        expect(bad.accepts('00')).toBe(true)
        expect(bad.accepts('11')).toBe(true)
        expect(bad.accepts('01')).toBe(false)
      })

      it('bug #28', function () {
        // Starification was broken in FSMs
        expect(greenRegExp.parse('ab*').accepts('a')).toBe(true)
        expect(greenRegExp.parse('ab*').accepts('b')).toBe(false)
        expect(greenRegExp.parse('(ab*)*').accepts('aab')).toBe(true)
        expect(greenRegExp.parse('(ab*)*').accepts('bb')).toBe(false)
      })

      it('block comment', function () {
        // I went through several incorrect regexes for C block comments. Here we show
        // why the first few attempts were incorrect
        var a = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*/')
        expect(a.accepts('/**/')).toBe(true)
        expect(a.accepts('/***/')).toBe(false)
        expect(a.accepts('/****/')).toBe(false)

        var b = greenRegExp.parse('/\\*(([^*]|\\*[^/])*)\\*/')
        expect(b.accepts('/**/')).toBe(true)
        expect(b.accepts('/***/')).toBe(false)
        expect(b.accepts('/****/')).toBe(true)

        var c = greenRegExp.parse('/\\*(([^*]|\\*+[^*/])*)\\*+/')
        expect(c.accepts('/**/')).toBe(true)
        expect(c.accepts('/***/')).toBe(true)
        expect(c.accepts('/****/')).toBe(true)
      })

      it('pattern', function () {
        // "a[^a]"
        var anota = greenRegExp.parse('a[^a]')
        expect(anota.accepts('a')).toBe(false)
        expect(anota.accepts('b')).toBe(false)
        expect(anota.accepts('aa')).toBe(false)
        expect(anota.accepts('ab')).toBe(true)
        expect(anota.accepts('ba')).toBe(false)
        expect(anota.accepts('bb')).toBe(false)

        // "0\\d"
        var zeroD = greenRegExp.parse('0\\d')
        expect(zeroD.accepts('01')).toBe(true)
        expect(zeroD.accepts('10')).toBe(false)

        // "\\d{2}"
        var d2 = greenRegExp.parse('\\d{2}')
        expect(d2.accepts('')).toBe(false)
        expect(d2.accepts('1')).toBe(false)
        expect(d2.accepts('11')).toBe(true)
        expect(d2.accepts('111')).toBe(false)

        // abc|def(ghi|jkl)
        var conventional = greenRegExp.parse('abc|def(ghi|jkl)')
        expect(conventional.accepts('a')).toBe(false)
        expect(conventional.accepts('ab')).toBe(false)
        expect(conventional.accepts('abc')).toBe(true)
        expect(conventional.accepts('abcj')).toBe(false)
        expect(conventional.accepts('defghi')).toBe(true)
        expect(conventional.accepts('defjkl')).toBe(true)
      })
    })

    describe('strings', function () {
      it('mult', function () {
        // One term
        var gen1 = greenRegExp.parse('[ab]').strings('c')
        expect(gen1.next().value).toBe('a')
        expect(gen1.next().value).toBe('b')
        expect(gen1.next().done).toBe(true)

        // No terms
        var gen0 = greenRegExp.parse('[ab]{0}').strings('c')
        expect(gen0.next().value).toBe('')
        expect(gen0.next().done).toBe(true)

        // Many terms
        var genStar = greenRegExp.parse('[ab]*').strings('c')
        expect(genStar.next().value).toBe('')
        expect(genStar.next().value).toBe('a')
        expect(genStar.next().value).toBe('b')
        expect(genStar.next().value).toBe('aa')
        expect(genStar.next().value).toBe('ab')
        expect(genStar.next().value).toBe('ba')
        expect(genStar.next().value).toBe('bb')
        expect(genStar.next().value).toBe('aaa')
      })

      it('infinite generation', function () {
        // Infinite generator, flummoxes both depth-first and breadth-first searches
        var gen = greenRegExp.parse('a*b*').strings('c')
        expect(gen.next().value).toBe('')
        expect(gen.next().value).toBe('a')
        expect(gen.next().value).toBe('b')
        expect(gen.next().value).toBe('aa')
        expect(gen.next().value).toBe('ab')
        expect(gen.next().value).toBe('bb')
        expect(gen.next().value).toBe('aaa')
        expect(gen.next().value).toBe('aab')
        expect(gen.next().value).toBe('abb')
        expect(gen.next().value).toBe('bbb')
        expect(gen.next().value).toBe('aaaa')
      })

      it('wildcards', function () {
        // Generator needs to handle wildcards as well. Wildcards come last.
        var gen = greenRegExp.parse('a.b').strings('c')
        expect(gen.next().value).toBe('aab')
        expect(gen.next().value).toBe('abb')
        expect(gen.next().value).toBe('acb')
        expect(gen.next().done).toBe(true)
      })

      it('pattern generators', function () {
        var genAbcde = greenRegExp.parse('[ab]|[cde]').strings('f')
        expect(genAbcde.next().value).toBe('a')
        expect(genAbcde.next().value).toBe('b')
        expect(genAbcde.next().value).toBe('c')
        expect(genAbcde.next().value).toBe('d')
        expect(genAbcde.next().value).toBe('e')
        expect(genAbcde.next().done).toBe(true)

        // more complex
        var gen3 = greenRegExp.parse('abc|def(ghi|jkl)').strings('m')
        expect(gen3.next().value).toBe('abc')
        expect(gen3.next().value).toBe('defghi')
        expect(gen3.next().value).toBe('defjkl')
        expect(gen3.next().done).toBe(true)

        var genNum = greenRegExp.parse('[0-9A-F]{3,10}').strings('_')
        expect(genNum.next().value).toBe('000')
        expect(genNum.next().value).toBe('001')
        expect(genNum.next().value).toBe('002')
      })
    })
  })

  fdescribe('intersection', () => {
    it('easy mode', () => {
      const intersection = greenRegExp.intersection('abc...', '...def')
      // /abcdef/
      console.log(intersection)
    })

    it('dates', () => {
      const intersection = greenRegExp.intersection('\\d{4}-\\d{2}-\\d{2}', '19.*')
      // /19\d{2}-\d{2}-\d{2}/
      console.log(intersection)
    })

    it('symbols', () => {
      const intersection = greenRegExp.intersection('\\W*', '[a-g0-8$%\\^]+', '[^d]{2,8}')
      // /[$%\^]{2,8}
      console.log(intersection)
    })

    it('complex stars', () => {
      const intersection = greenRegExp.intersection('[bc]*[ab]*', '[ab]*[bc]*')
      // /([ab]*a|[bc]*c)?b*/ or similar
      console.log(intersection)
    })

    it('epsilon intersection', () => {
      const intersection = greenRegExp.intersection('a*', 'b*')
      // //
      console.log(intersection)
    })

    it('null intersection', () => {
      const intersection = greenRegExp.intersection('a', 'b')
      // /[]/
      console.log(intersection)
    })
  })
})
