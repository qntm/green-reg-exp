'use strict'

// Operates on ARRAYS.
const arrayOps = {
  and: (self, other) => self.filter(x => other.includes(x)),
  or: (self, other) => self.concat(other.filter(x => !self.includes(x))),
  minus: (self, other) => self.filter(x => !other.includes(x)),
  equal: (self, other) => [...arrayOps.minus(self, other), ...arrayOps.minus(other, self)].length === 0
}

module.exports = arrayOps
