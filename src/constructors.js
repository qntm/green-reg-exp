import { fsm } from 'green-fsm'

import escapesBracket from './escapes-bracket.js'
import escapesRegular from './escapes-regular.js'

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
export const multiplier = (lower, upper) => {
  if (!Number.isInteger(lower) || lower < 0) {
    throw Error("Minimum bound of a multiplier can't be " + String(lower))
  }

  if (lower > upper) {
    throw Error('Invalid multiplier bounds: ' + String(lower) + ' and ' + String(upper))
  }

  return { type: 'multiplier', lower, upper }
}

export const multiplicand = inner => {
  if (!(inner instanceof Charclass) && inner.type !== 'pattern') {
    throw Error(inner.type)
  }
  return { type: 'multiplicand', inner }
}

/**
  A mult is a combination of a multiplicand with
  a multiplier.
  e.g. a, b{2}, c?, d*, [efg]{2,5}, f{2,}, (anysubpattern)+, .*, and so on
*/
export const mult = (multiplicand, multiplier) => {
  if (multiplicand.type !== 'multiplicand') {
    throw Error('Expected multiplicand to have type multiplicand, not ' + multiplicand.type)
  }
  if (multiplier.type !== 'multiplier') {
    throw Error()
  }
  return { type: 'mult', multiplicand, multiplier }
}

/**
  "^" means "start of input", "$" means "end of input".
  These get FACTORED OUT.
  anchor(false) = "^", anchor(true) = "$"
*/
export const anchor = end => {
  return { type: 'anchor', end }
}

export const term = inner => {
  if (inner.type !== 'mult' && inner.type !== 'anchor') {
    throw Error('Bad type ' + inner.type + ', expected mult or anchor')
  }
  return { type: 'term', inner }
}

/**
  To express the empty string, use an empty conc, conc().
*/
export const conc = terms => {
  terms.forEach(term => {
    if (term.type !== 'term') {
      throw Error('Bad type ' + term.type + ', expected term')
    }
  })
  return { type: 'conc', terms }
}

/**
  A pattern (also known as an "alt", short for "alternation") is a
  set of concs. A pattern expresses multiple alternate possibilities.
  When written out as a regex, these would separated by pipes. A pattern
  containing no possibilities is possible and represents a regular expression
  matching no strings whatsoever (there is no conventional string form for
  this).

  e.g. "abc|def(ghi|jkl)" is an alt containing two concs: "abc" and
  "def(ghi|jkl)". The latter is a conc containing four terms: "d", "e", "f"
  and "(ghi|jkl)". The latter in turn is a mult consisting of an upper bound
  1, a lower bound 1, and a multiplicand which is a new subpattern, "ghi|jkl".
  This new subpattern again consists of two concs: "ghi" and "jkl".
*/

export const pattern = concs => {
  if (concs.some(conc => conc.type !== 'conc')) {
    throw Error('Bad type')
  }
  return { type: 'pattern', concs }
}
