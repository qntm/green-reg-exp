import { fsm, multiply, star, union, epsilon, concatenate } from 'green-fsm'

import { arrayOps } from './array-ops.js'
import escapesBracket from './escapes-bracket.js'
import escapesRegular from './escapes-regular.js'
import { equals } from './equals.js'
import { fsmify } from './fsmify.js'
import matchers from './matchers.js'

const bracketEscape = chars => {
  const runs = []
  chars
    .slice()
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
    .forEach(chr => {
      // Start a new run?
      if (
        // no current run
        runs.length === 0 ||
        (
          // current run is not empty and new char doesn't fit after previous one
          runs[runs.length - 1].length > 0 &&
          chr.charCodeAt(0) !== runs[runs.length - 1][runs[runs.length - 1].length - 1].charCodeAt(0) + 1
        )
      ) {
        runs.push([])
      }

      runs[runs.length - 1].push(chr)
    })

  return runs
    .map(run => run.map(chr => escapesBracket[chr] || chr))

    // there's no point in putting a run when the whole thing is
    // 3 characters or fewer. "abc" -> "abc" but "abcd" -> "a-d"
    .map(run => [
      // "a" or "ab" or "abc" or "abcd"
      run.join(''),

      // "a-a" or "a-b" or "a-c" or "a-d"
      run[0] + '-' + run[run.length - 1]
    ].sort((a, b) => a.length - b.length)[0])

    .join('')
}

export class Charclass {
  constructor (chars, negated) {
    if (!Array.isArray(chars)) {
      throw Error('`chars` must be an array')
    }

    if (negated === undefined) {
      throw Error('Must specify whether negated')
    }

    chars.forEach(chr => {
      if (typeof chr !== 'string' || chr.length !== 1) {
        throw Error('Unacceptable character ' + chr)
      }
    })

    const seen = {}
    chars.forEach(chr => {
      if (chr in seen) {
        throw Error('Duplicate character in charclass, ' + chr)
      }
      seen[chr] = true
    })

    this.chars = chars
    this.negated = negated
  }

  serialise () {
    if (JSON.stringify(this.chars) === JSON.stringify([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
      'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
      'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ])) {
      return this.negated ? '\\W' : '\\w'
    }

    if (JSON.stringify(this.chars) === JSON.stringify([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ])) {
      return this.negated ? '\\D' : '\\d'
    }

    if (JSON.stringify(this.chars) === JSON.stringify([
      '\t', '\n', '\v', '\f', '\r', ' '
    ])) {
      return this.negated ? '\\S' : '\\s'
    }

    if (this.chars.length === 0 && this.negated) {
      return '.'
    }

    if (this.negated) {
      // e.g. [^a]
      return '[^' + bracketEscape(this.chars) + ']'
    }

    if (this.chars.length === 1) {
      // single character, not contained inside square brackets.
      return escapesRegular[this.chars[0]] || this.chars[0]
    }

    // multiple characters (or possibly 0 characters)
    return '[' + bracketEscape(this.chars) + ']'
  }

  equals (other) {
    return other instanceof Charclass &&
      this.chars.length === other.chars.length &&
      this.chars.every((chr, i) => chr === other.chars[i]) &&
      this.negated === other.negated
  }

  fsmify (alphabet) {
    // "0" is initial, "1" is final
    const map = {
      0: {}
    }

    // If normal, make a singular FSM accepting only these characters
    // If negated, make a singular FSM accepting any other characters
    alphabet
      .filter(chr => this.chars.includes(chr) !== this.negated)
      .forEach(chr => {
        map['0'][chr] = '1'
      })

    return fsm(alphabet, ['0', '1'], '0', ['1'], map)
  }

  getUsedChars () {
    const usedChars = {}
    this.chars.forEach(chr => {
      usedChars[chr] = true
    })
    return usedChars
  }

  matchesEmptyString () {
    return false
  }

  reduced () {
    // charclasses can't be reduced.
    return this
  }
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
export class Multiplier {
  constructor (lower, upper) {
    if (!Number.isInteger(lower) || lower < 0) {
      throw Error("Minimum bound of a multiplier can't be " + String(lower))
    }

    if (lower > upper) {
      throw Error('Invalid multiplier bounds: ' + String(lower) + ' and ' + String(upper))
    }

    this.lower = lower
    this.upper = upper
  }

  equals (other) {
    return other instanceof Multiplier &&
      this.lower === other.lower &&
      this.upper === other.upper
  }

  serialise () {
    if (this.lower === 0 && this.upper === 1) {
      return '?'
    }

    if (this.lower === 1 && this.upper === 1) {
      return ''
    }

    if (this.lower === 0 && this.upper === Infinity) {
      return '*'
    }

    if (this.lower === 1 && this.upper === Infinity) {
      return '+'
    }

    if (this.lower === this.upper) {
      return '{' + String(this.lower) + '}'
    }

    if (this.upper === Infinity) {
      return '{' + String(this.lower) + ',}'
    }

    return '{' + String(this.lower) + ',' + String(this.upper) + '}'
  }
}

export class Multiplicand {
  constructor (inner) {
    if (!(inner instanceof Charclass) && !(inner instanceof Pattern)) {
      throw Error(inner.type)
    }

    this.inner = inner
  }

  equals (other) {
    return other instanceof Multiplicand &&
      equals(this.inner, other.inner)
  }

  fsmify (alphabet) {
    return fsmify(this.inner, alphabet)
  }

  getUsedChars () {
    return this.inner.getUsedChars()
  }

  matchesEmptyString () {
    return this.inner.matchesEmptyString()
  }

  reduced () {
    // Empty pattern becomes /[]/ since the latter is serialisable
    if (equals(this.inner, new Pattern([]))) {
      return new Multiplicand(
        new Charclass([], false)
      ).reduced()
    }

    // e.g. /([ab])/ to /[ab]/
    if (
      this.inner instanceof Pattern &&
      this.inner.concs.length === 1 &&
      this.inner.concs[0].terms.length === 1 &&
      this.inner.concs[0].terms[0].inner instanceof Mult &&
      equals(this.inner.concs[0].terms[0].inner.multiplier, new Multiplier(1, 1))
    ) {
      return this.inner.concs[0].terms[0].inner.multiplicand.reduced()
    }

    const shrunk = new Multiplicand(this.inner.reduced())
    if (!equals(shrunk, this)) {
      return shrunk.reduced()
    }

    return this
  }

  serialise () {
    return this.inner instanceof Pattern
      ? '(' + this.inner.serialise() + ')'
      : this.inner.serialise()
  }
}

/**
  A Mult is a combination of a multiplicand with
  a multiplier.
  e.g. a, b{2}, c?, d*, [efg]{2,5}, f{2,}, (anysubpattern)+, .*, and so on
*/
export class Mult {
  constructor (multiplicand, multiplier) {
    if (!(multiplicand instanceof Multiplicand)) {
      throw Error('Expected multiplicand to have type multiplicand, not ' + multiplicand.type)
    }
    if (!(multiplier instanceof Multiplier)) {
      throw Error()
    }
    this.multiplicand = multiplicand
    this.multiplier = multiplier
  }

  equals (other) {
    return other instanceof Mult &&
      equals(this.multiplicand, other.multiplicand) &&
      equals(this.multiplier, other.multiplier)
  }

  fsmify (alphabet) {
    // worked example: (min, max) = (5, 7) or (5, inf)
    // (mandatory, optional) = (5, 2) or (5, inf)

    const unit = fsmify(this.multiplicand, alphabet)
    // accepts e.g. "ab"

    // accepts "ababababab"
    const mandatory = multiply(unit, this.multiplier.lower)

    // unlimited additional copies
    const optional = this.multiplier.upper === Infinity
      ? star(unit)
      : multiply(union([epsilon(alphabet), unit]), this.multiplier.upper - this.multiplier.lower)

    return concatenate([mandatory, optional])
  }

  getUsedChars () {
    return this.multiplicand.getUsedChars()
  }

  matchesEmptyString () {
    return this.multiplicand.matchesEmptyString() || this.multiplier.lower === 0
  }

  reduced () {
    const shrunk = new Mult(this.multiplicand.reduced(), this.multiplier)
    if (!equals(shrunk, this)) {
      return shrunk.reduced()
    }

    return this
  }

  serialise () {
    return this.multiplicand.serialise() + this.multiplier.serialise()
  }
}

/**
  "^" means "start of input", "$" means "end of input".
  These get FACTORED OUT.
  new Anchor(false) = "^", new Anchor(true) = "$"
*/
export class Anchor {
  constructor (end) {
    this.end = end
  }

  fsmify () {
    throw Error('Cannot make an FSM out of an anchor.')
  }

  equals (other) {
    return other instanceof Anchor &&
      this.end === other.end
  }

  getUsedChars () {
    return {}
  }

  serialise () {
    return this.end ? '$' : '^'
  }
}

export class Term {
  constructor (inner) {
    if (!(inner instanceof Mult) && !(inner instanceof Anchor)) {
      throw Error('Bad type ' + inner.type + ', expected Mult or Anchor')
    }

    this.inner = inner
  }

  serialise () {
    return this.inner.serialise()
  }

  equals (other) {
    return other instanceof Term &&
      equals(this.inner, other.inner)
  }

  fsmify (alphabet) {
    return fsmify(this.inner, alphabet)
  }

  getUsedChars () {
    return this.inner.getUsedChars()
  }

  matchesEmptyString () {
    return this.inner.matchesEmptyString()
  }

  reduced () {
    const shrunk = new Term(this.inner.reduced())
    if (!equals(shrunk, this)) {
      return shrunk.reduced()
    }

    return this
  }
}

/**
  To express the empty string, use an empty Conc, new Conc().
*/
export class Conc {
  constructor (terms) {
    terms.forEach(term => {
      if (!(term instanceof Term)) {
        throw Error('Bad type ' + term.type + ', expected term')
      }
    })

    this.terms = terms
  }

  equals (other) {
    return other instanceof Conc &&
      this.terms.length === other.terms.length &&
      this.terms.every((term, i) => equals(term, other.terms[i]))
  }

  fsmify (alphabet) {
    return concatenate(this.terms.map(term => fsmify(term, alphabet)))
  }

  getUsedChars () {
    return Object.assign.apply(Object, [{}].concat(this.terms.map(term => term.getUsedChars())))
  }

  matchesEmptyString () {
    return this.terms.every(term => term.matchesEmptyString())
  }

  serialise () {
    return this.terms.map(term => term.serialise()).join('')
  }

  reduced () {
    // First things first, ANCHORS.
    // /a?^/ becomes /^/
    // /a?^b?^/ becomes /^/

    // Strip out []*, []{0}, etc. from the listing
    // /abc[]*def/ becomes /abcdef/
    const killDeads = this.terms.filter(term =>
      term.inner instanceof Mult && (
        !equals(term.inner.multiplicand, matchers.multiplicand.parse1('[]')) ||
        term.inner.multiplier.lower !== 0
      )
    )
    if (killDeads.length < this.terms.length) {
      return new Conc(killDeads).reduced()
    }

    // /abc[]def/ becomes /[]/
    if (this.terms.length > 1 && this.terms.some(term => equals(term, matchers.term.parse1('[]')))) {
      return new Conc([matchers.term.parse1('[]')]).reduced()
    }

    // /(((aby)))/ becomes /aby/
    if (
      this.terms.length === 1 &&
      this.terms[0].inner instanceof Mult &&
      this.terms[0].inner.multiplicand.inner instanceof Pattern &&
      this.terms[0].inner.multiplicand.inner.concs.length === 1 &&
      equals(this.terms[0].inner.multiplier, new Multiplier(1, 1))
    ) {
      return this.terms[0].inner.multiplicand.inner.concs[0].reduced()
    }

    // /a(d(ab|a*c))/ to /ad(ab|a*c)/
    // /ab(cd)ef/ to /abcdef/
    for (let i = 0; i < this.terms.length; i++) {
      if (
        this.terms[i].inner instanceof Mult &&
        this.terms[i].inner.multiplicand.inner instanceof Pattern &&
        this.terms[i].inner.multiplicand.inner.concs.length === 1 &&
        this.terms[i].inner.multiplier.lower === 1 &&
        this.terms[i].inner.multiplier.upper === 1
      ) {
        return new Conc(
          this.terms.slice(0, i)
            .concat(this.terms[i].inner.multiplicand.inner.concs[0].terms)
            .concat(this.terms.slice(i + 1))
        ).reduced()
      }
    }

    const shrunk = new Conc(this.terms.map(term => term.reduced()))
    if (!equals(shrunk, this)) {
      return shrunk.reduced()
    }

    return this
  }
}

/**
  A Pattern (also known as an "alt", short for "alternation") is a
  set of Concs. A Pattern expresses multiple alternate possibilities.
  When written out as a regex, these would separated by pipes. A Pattern
  containing no possibilities is possible and represents a regular expression
  matching no strings whatsoever (there is no conventional string form for
  this).

  e.g. "abc|def(ghi|jkl)" is an alt containing two Concs: "abc" and
  "def(ghi|jkl)". The latter is a Conc containing four terms: "d", "e", "f"
  and "(ghi|jkl)". The latter in turn is a Mult consisting of an upper bound
  1, a lower bound 1, and a multiplicand which is a new subpattern, "ghi|jkl".
  This new subpattern again consists of two Concs: "ghi" and "jkl".
*/

export class Pattern {
  constructor (concs) {
    if (concs.some(conc => !(conc instanceof Conc))) {
      throw Error('Bad type')
    }

    this.concs = concs
  }

  fsmify (alphabet) {
    return union(this.concs.map(conc => fsmify(conc, alphabet)))
  }

  reduced () {
    // Unify charclasses e.g. /a|b|cde/ becomes /[ab]|cde/
    const charclassConcs = []
    const nonCharclassConcs = []
    this.concs.forEach(conc => {
      if (
        conc.terms.length === 1 &&
        conc.terms[0].inner instanceof Mult &&
        conc.terms[0].inner.multiplicand.inner instanceof Charclass &&
        conc.terms[0].inner.multiplier.lower === 1 &&
        conc.terms[0].inner.multiplier.upper === 1
      ) {
        charclassConcs.push(conc)
      } else {
        nonCharclassConcs.push(conc)
      }
    })

    if (charclassConcs.length >= 2) {
      const charclasses = charclassConcs.map(charclassConc =>
        charclassConc.terms[0].inner.multiplicand.inner
      )

      const combinedCharclass = charclasses.reduce((acc, next) => {
        if (acc.negated) {
          if (next.negated) {
            return new Charclass(arrayOps.and(acc.chars, next.chars), true)
          } else {
            return new Charclass(arrayOps.minus(acc.chars, next.chars), true)
          }
        } else {
          if (next.negated) {
            return new Charclass(arrayOps.minus(next.chars, acc.chars), true)
          } else {
            return new Charclass(arrayOps.or(acc.chars, next.chars), false)
          }
        }
      }, new Charclass([], false))

      const combinedCharclassConc = new Conc([
        new Term(
          new Mult(
            new Multiplicand(
              combinedCharclass
            ),
            new Multiplier(1, 1)
          )
        )
      ])

      return new Pattern([
        combinedCharclassConc,
        ...nonCharclassConcs
      ]).reduced()
    }

    // /[]|abc|def/ becomes /abc|def/
    const killDeads = this.concs.filter(conc =>
      !equals(conc, matchers.conc.parse1('[]'))
    )
    if (killDeads.length < this.concs.length) {
      return new Pattern(killDeads).reduced()
    }

    // /abc|abc/ becomes /abc/
    const removeDuplicates = this.concs.filter((conc, i) =>
      !this.concs.slice(0, i).some(otherConc => equals(conc, otherConc))
    )
    if (removeDuplicates.length < this.concs.length) {
      return new Pattern(removeDuplicates).reduced()
    }

    const shrunk = new Pattern(this.concs.map(conc => conc.reduced()))
    if (!equals(shrunk, this)) {
      return shrunk.reduced()
    }

    return this
  }

  serialise () {
    if (this.concs.length === 0) {
      return '[]'
    }
    return this.concs.map(conc => conc.serialise()).join('|')
  }

  equals (other) {
    return other instanceof Pattern &&
      this.concs.length === other.concs.length &&
      this.concs.every((conc, i) => equals(conc, other.concs[i]))
  }

  getUsedChars () {
    return Object.assign.apply(Object, [{}].concat(this.concs.map(conc => conc.getUsedChars())))
  }

  matchesEmptyString () {
    return this.concs.some(conc => conc.matchesEmptyString())
  }
}
