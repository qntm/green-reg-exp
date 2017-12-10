'use strict'

const matchers = require('./matchers')
const {MonoParser} = require('green-parse')

const monoParsers = {}

Object.keys(matchers).forEach(key => {
  monoParsers[key] = MonoParser(matchers[key])
})

module.exports = monoParsers
