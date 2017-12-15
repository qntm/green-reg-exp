'use strict'

const arrayOps = require('./array-ops')

const equals = (self, other) => ({
  charclass: (self, other) =>
    self.type === other.type &&
    self.chars.length === other.chars.length &&
    self.chars.every((chr, i) => chr === other.chars[i]) &&
    self.negated === other.negated,

  multiplier: (self, other) =>
    self.type === other.type &&
    self.lower === other.lower &&
    self.upper === other.upper,

  multiplicand: (self, other) =>
    self.type === other.type &&
    equals(self.inner, other.inner),

  mult: (self, other) =>
    self.type === other.type &&
    equals(self.multiplicand, other.multiplicand) &&
    equals(self.multiplier, other.multiplier),

  conc: (self, other) =>
    self.type === other.type &&
    self.mults.length === other.mults.length &&
    self.mults.every((mult, i) => equals(mult, other.mults[i])),

  pattern: (self, other) =>
    self.type === other.type &&
    self.concs.length === other.concs.length &&
    self.concs.every((conc, i) => equals(conc, other.concs[i]))
})[self.type](self, other)

module.exports = equals
