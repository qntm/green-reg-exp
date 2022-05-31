// Operates on ARRAYS.
export const arrayOps = {
  and: (self, other) => self.filter(x => other.includes(x)),
  or: (self, other) => self.concat(other.filter(x => !self.includes(x))),
  minus: (self, other) => self.filter(x => !other.includes(x)),
  equal: (self, other) => [...arrayOps.minus(self, other), ...arrayOps.minus(other, self)].length === 0,

  product: (...arrs) => {
    const results = []
    if (arrs.length === 0) {
      results.push([])
    } else {
      arrs[0].forEach(entry => {
        arrayOps.product(...arrs.slice(1)).forEach(remainder => {
          results.push([entry, ...remainder])
        })
      })
    }
    return results
  }
}
