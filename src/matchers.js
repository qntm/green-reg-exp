'use strict'

const {unicode, or, fixed, seq, resolve, star, wplus} = require('green-parse')
const constructors = require('./constructors.js')
const escapesBracket = require('./escapes-bracket.js')
const escapesRegular = require('./escapes-regular.js')

// Non-special character, not escaped
const matchNonEscapedBracketedChar = unicode
  .filter(match => !(match in escapesBracket))

// Special character, escaped
const matchEscapedBracketedChar = or(Object
  .keys(escapesBracket)
  .map(before =>
    fixed(escapesBracket[before])
    .map(() => before)
  )
)

/** Match a single character INSIDE square brackets */
const matchBracketedChar = or([
  matchNonEscapedBracketedChar,
  matchEscapedBracketedChar
])

const matchRun = or([
  // "d-h"
  seq([matchBracketedChar, fixed('-'), matchBracketedChar])
    .map(([first, hyphen, last]) => {
      const firstCodePoint = first.codePointAt(0) // 100
      const lastCodePoint = last.codePointAt(0) // 104

      // Be strict here, "d-d" is not allowed
      if (lastCodePoint <= firstCodePoint) {
        throw Error("Range '" + first + '-' + last + "' not allowed")
      }

      const modified = []
      for (let codePoint = firstCodePoint; codePoint <= lastCodePoint; codePoint++) {
        modified.push(String.fromCodePoint(codePoint))
      }

      return modified
    }),

  // Just a character on its own, e.g. "d"
  matchBracketedChar
    .map(match => [match])
])

const matchRuns = matchRun.star()
  .map(match => Array.prototype.concat.apply([], match))

// "[^dsgsdg]"
const matchBracketedNegated = seq([fixed('[^'), matchRuns, fixed(']')])
  .map(([open, runs, closed]) => ({chars: runs, negated: true}))

// "[sdfsf]"
const matchBracketed = seq([fixed('['), matchRuns, fixed(']')])
  .map(([open, runs, closed]) => ({chars: runs, negated: false}))

// Textual representations of standard character classes
const matchShorthand = or([
  fixed('\\w').map(() => ({chars: [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
    'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ],
    negated: false})),
  fixed('\\W').map(() => ({chars: [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
    'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ],
    negated: true})),
  fixed('\\d').map(() => ({chars: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], negated: false})),
  fixed('\\D').map(() => ({chars: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], negated: true})),
  fixed('\\s').map(() => ({chars: ['\t', '\n', '\v', '\f', '\r', ' '], negated: false})),
  fixed('\\S').map(() => ({chars: ['\t', '\n', '\v', '\f', '\r', ' '], negated: true})),
  fixed('.').map(() => ({chars: [], negated: true}))
])

// single non-special character, not contained inside square brackets
const matchNonEscapedCharacter = unicode
  .filter(match => !(match in escapesRegular))

// Special character, escaped
const matchEscapedCharacter = or(Object
  .keys(escapesRegular)
  .map(before =>
    fixed(escapesRegular[before])
      .map(() => before)
  )
)

const matchChar = or([
  matchNonEscapedCharacter,
  matchEscapedCharacter
])
  .map(match => ({chars: [match], negated: false}))

var matchZero = fixed('0')
  .map(() => 0)

var matchNonZeroDigit = or('123456789'.split('').map(fixed))
  .map(match => parseInt(match, 10))

var matchDigit = or('0123456789'.split('').map(fixed))
  .map(match => parseInt(match, 10))

var matchPositiveInteger = seq([matchNonZeroDigit, matchDigit.star()])
  .map(([nonZeroDigit, digits]) => digits.reduce((acc, digit) => acc * 10 + digit, nonZeroDigit))

// "" empty string = infinite bound as in "{4,}"
var matchUnbounded = fixed('')
  .map(() => Infinity)

// In the new universe it shouldn't matter what order these appear in!
var matchBound = or([matchZero, matchPositiveInteger, matchUnbounded])

// {2,3} or {2,}
var matchTwoBounds = seq([fixed('{'), matchBound, fixed(','), matchBound, fixed('}')])
  .map(([open, lower, comma, upper, closed]) => ({lower, upper}))

// {2}
var matchOneBound = seq([fixed('{'), matchBound, fixed('}')])
  .map(([open, bound, lower]) => ({lower: bound, upper: bound}))

// "?"/"*"/"+"/""
// Thanks to iterators these no longer need to be in any particular order?
var matchSymbolicMultiplier = or([
  fixed('').map(value => ({lower: 1, upper: 1})),
  fixed('?').map(value => ({lower: 0, upper: 1})),
  fixed('*').map(value => ({lower: 0, upper: Infinity})),
  fixed('+').map(value => ({lower: 1, upper: Infinity}))
])

module.exports = resolve({
  charclass: matchers => or([
    matchChar,
    matchShorthand,
    matchBracketed,
    matchBracketedNegated
  ])
    .map(({chars, negated}) => constructors.charclass(chars, negated)),

  multiplier: matchers => or([
    matchSymbolicMultiplier,
    matchOneBound,
    matchTwoBounds
  ])
    .map(({lower, upper}) => constructors.multiplier(lower, upper)),

  multiplicand: matchers => or([
    matchers.charclass,
    seq([fixed('('), matchers.pattern, fixed(')')])
      .map(([open, pattern, closed]) => pattern)
  ])
    .map(inner => constructors.multiplicand(inner)),

  mult: matchers => seq([matchers.multiplicand, matchers.multiplier])
    .map(([multiplicand, multiplier]) => constructors.mult(multiplicand, multiplier)),

  anchor: matchers => or([
    fixed('^').map(() => constructors.anchor(false)),
    fixed('$').map(() => constructors.anchor(true))
  ]),

  term: matchers => or([
    matchers.mult,
    matchers.anchor
  ])
    .map(constructors.term),

  conc: matchers => star(matchers.term)
    .map(constructors.conc),

  pattern: matchers => wplus(matchers.conc, fixed('|'))
    .map(constructors.pattern)
})
