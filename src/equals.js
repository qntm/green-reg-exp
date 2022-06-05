import * as constructors from './constructors.js'

export const equals = (self, other) => {
  if (
    self instanceof constructors.Charclass ||
    self instanceof constructors.Multiplier ||
    self instanceof constructors.Multiplicand ||
    self instanceof constructors.Mult ||
    self instanceof constructors.Anchor
  ) {
    return self.equals(other)
  }

  return {
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
  }[self.type](self, other)
}
