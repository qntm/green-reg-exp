/* eslint-env jasmine */

'use strict'

const monoParsers = require('../src/mono-parsers.js')
const reducers = require('../src/reducers.js')

describe('reducers', function () {
  describe('charclass', function () {
    it('works', function () {
      expect(reducers.charclass(monoParsers.charclass('\\w'))).toEqual(monoParsers.charclass('\\w'))
    })
  })

  describe('multiplicand', () => {
    it('works', () => {
      expect(reducers.multiplicand(monoParsers.multiplicand('([ab])'))).toEqual(monoParsers.multiplicand('[ab]'))
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(reducers.mult(monoParsers.mult('([ab])*'))).toEqual(monoParsers.mult('[ab]*'))
      expect(reducers.mult(monoParsers.mult('([ab]*)'))).not.toEqual(monoParsers.mult('[ab]*'))
    })
  })

  describe('conc', () => {
    it('works', () => {
      expect(reducers.conc(monoParsers.conc('([ab])*'))).toEqual(monoParsers.conc('[ab]*'))
      expect(reducers.conc(monoParsers.conc('abc()d()ef'))).toEqual(monoParsers.conc('abcdef'))
      expect(reducers.conc(monoParsers.conc('abc(de)f'))).toEqual(monoParsers.conc('abcdef'))
    })
  })

  describe('pattern', () => {
    it('works', () => {
      expect(reducers.pattern(monoParsers.pattern('([ab])*'))).toEqual(monoParsers.pattern('[ab]*'))
    })
  })
})
