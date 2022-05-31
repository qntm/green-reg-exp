'use strict'

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

  anchor: (self, other) =>
    self.type === other.type &&
    self.end === other.end,

  term: (self, other) =>
    self.type === other.type &&
    equals(self.inner, other.inner),

  conc: (self, other) =>
    self.type === other.type &&
    self.terms.length === other.terms.length &&
    self.terms.every((term, i) => equals(term, other.terms[i])),

  pattern: (self, other) =>
    self.type === other.type &&
    self.concs.length === other.concs.length &&
    self.concs.every((conc, i) => equals(conc, other.concs[i]))
})[self.type](self, other)

module.exports = equals
