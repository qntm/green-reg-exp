import * as constructors from './constructors.js'

export const equals = (self, other) => {
  if (
    self instanceof constructors.Charclass ||
    self instanceof constructors.Multiplier ||
    self instanceof constructors.Multiplicand ||
    self instanceof constructors.Mult ||
    self instanceof constructors.Anchor ||
    self instanceof constructors.Term ||
    self instanceof constructors.Conc
  ) {
    return self.equals(other)
  }

  return {
    pattern: (self, other) =>
      self.type === other.type &&
      self.concs.length === other.concs.length &&
      self.concs.every((conc, i) => equals(conc, other.concs[i]))
  }[self.type](self, other)
}
