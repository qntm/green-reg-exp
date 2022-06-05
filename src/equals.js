import * as constructors from './constructors.js'

export const equals = (self, other) => {
  if (
    self instanceof constructors.Charclass ||
    self instanceof constructors.Multiplier ||
    self instanceof constructors.Multiplicand ||
    self instanceof constructors.Mult ||
    self instanceof constructors.Anchor ||
    self instanceof constructors.Term ||
    self instanceof constructors.Conc ||
    self instanceof constructors.Pattern
  ) {
    return self.equals(other)
  }

  return {
  }[self.type](self, other)
}
