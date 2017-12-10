'use strict'

const charclass = (chars, negated) => {
  if (!Array.isArray(chars)) {
    console.error(chars)
    throw Error('`chars` must be an array')
  }

  if (arguments.length < 2) {
    throw Error('Must specify whether negated')
  }

  chars.forEach(function (chr) {
    if (typeof chr !== 'string' || chr.length !== 1) {
      throw Error('Unacceptable character ' + chr)
    }
  })

  chars = chars.slice().sort()

  return {type: 'charclass', chars, negated}
}

/**
  A lower and an upper. The vast majority of characters in regular
  expressions occur without a specific multiplier, which is implicitly
  equivalent to a lower bound of 1 and an upper bound of 1, but many more have explicit
  multipliers like "*" (lower = 0, upper = inf) and so on.
  Although it seems odd and can lead to some confusing edge cases, we do
  also permit an upper bound of 0 (iff lower is 0 too). This allows the multiplier
  "zero" to exist, which actually is quite useful in its own special way.
*/
const multiplier = (lower, upper) => {
  if (!Number.isInteger(lower) || lower < 0) {
    throw Error("Minimum bound of a multiplier can't be " + String(lower))
  }

  if (lower > upper) {
    throw Error('Invalid multiplier bounds: ' + String(lower) + ' and ' + String(upper))
  }

  return {type: 'multiplier', lower, upper}
}

/**
  A mult is a combination of a multiplicand with
  a multiplier.
  e.g. a, b{2}, c?, d*, [efg]{2,5}, f{2,}, (anysubpattern)+, .*, and so on
*/
const mult = (multiplicand, multiplier) =>
  ({type: 'mult', multiplicand, multiplier})

/**
  A conc (short for "concatenation") is a tuple of mults i.e. an unbroken
  string of mults occurring one after the other.
  e.g. abcde[^fg]*h{4}[a-z]+(subpattern)(subpattern2)
  To express the empty string, use an empty conc, conc().
*/
const conc = mults =>
  ({type: 'conc', mults})

/**
  A pattern (also known as an "alt", short for "alternation") is a
  set of concs. A pattern expresses multiple alternate possibilities.
  When written out as a regex, these would separated by pipes. A pattern
  containing no possibilities is possible and represents a regular expression
  matching no strings whatsoever (there is no conventional string form for
  this).

  e.g. "abc|def(ghi|jkl)" is an alt containing two concs: "abc" and
  "def(ghi|jkl)". The latter is a conc containing four mults: "d", "e", "f"
  and "(ghi|jkl)". The latter in turn is a mult consisting of an upper bound
  1, a lower bound 1, and a multiplicand which is a new subpattern, "ghi|jkl".
  This new subpattern again consists of two concs: "ghi" and "jkl".
*/

const pattern = concs =>
  ({type: 'pattern', concs})

module.exports = {charclass, multiplier, mult, conc, pattern}
