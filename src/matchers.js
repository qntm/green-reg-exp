import { UNICODE, or, fixed, seq, resolve } from 'green-parse'
import * as constructors from './constructors.js'
import escapesBracket from './escapes-bracket.js'
import escapesRegular from './escapes-regular.js'

// Non-special character, not escaped
const matchNonEscapedBracketedChar = UNICODE
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
  .map(([open, runs, closed]) => ({ chars: runs, negated: true }))

// "[sdfsf]"
const matchBracketed = seq([fixed('['), matchRuns, fixed(']')])
  .map(([open, runs, closed]) => ({ chars: runs, negated: false }))

// Textual representations of standard character classes
const matchShorthand = or([
  fixed('\\w').map(() => ({
    chars: [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
      'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
      'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ],
    negated: false
  })),
  fixed('\\W').map(() => ({
    chars: [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
      'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
      'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ],
    negated: true
  })),
  fixed('\\d').map(() => ({ chars: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], negated: false })),
  fixed('\\D').map(() => ({ chars: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], negated: true })),
  fixed('\\s').map(() => ({ chars: ['\t', '\n', '\v', '\f', '\r', ' '], negated: false })),
  fixed('\\S').map(() => ({ chars: ['\t', '\n', '\v', '\f', '\r', ' '], negated: true })),
  fixed('.').map(() => ({ chars: [], negated: true }))
])

// single non-special character, not contained inside square brackets
const matchNonEscapedCharacter = UNICODE
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
  .map(match => ({ chars: [match], negated: false }))

const matchZero = fixed('0')
  .map(() => 0)

const matchNonZeroDigit = or('123456789'.split('').map(fixed))
  .map(match => parseInt(match, 10))

const matchDigit = or('0123456789'.split('').map(fixed))
  .map(match => parseInt(match, 10))

const matchPositiveInteger = seq([matchNonZeroDigit, matchDigit.star()])
  .map(([nonZeroDigit, digits]) => digits.reduce((acc, digit) => acc * 10 + digit, nonZeroDigit))

// "" empty string = infinite bound as in "{4,}"
const matchUnbounded = fixed('')
  .map(() => Infinity)

// In the new universe it shouldn't matter what order these appear in!
const matchBound = or([matchZero, matchPositiveInteger, matchUnbounded])

// {2,3} or {2,}
const matchTwoBounds = seq([fixed('{'), matchBound, fixed(','), matchBound, fixed('}')])
  .map(([open, lower, comma, upper, closed]) => ({ lower, upper }))

// {2}
const matchOneBound = seq([fixed('{'), matchBound, fixed('}')])
  .map(([open, bound, lower]) => ({ lower: bound, upper: bound }))

// "?"/"*"/"+"/""
// Thanks to iterators these no longer need to be in any particular order?
const matchSymbolicMultiplier = or([
  fixed('').map(value => ({ lower: 1, upper: 1 })),
  fixed('?').map(value => ({ lower: 0, upper: 1 })),
  fixed('*').map(value => ({ lower: 0, upper: Infinity })),
  fixed('+').map(value => ({ lower: 1, upper: Infinity }))
])

export default resolve(ref => ({
  charclass: or([
    matchChar,
    matchShorthand,
    matchBracketed,
    matchBracketedNegated
  ])
    .map(({ chars, negated }) => new constructors.Charclass(chars, negated)),

  multiplier: or([
    matchSymbolicMultiplier,
    matchOneBound,
    matchTwoBounds
  ])
    .map(({ lower, upper }) => new constructors.Multiplier(lower, upper)),

  multiplicand: or([
    ref('charclass'),
    seq([fixed('('), ref('pattern'), fixed(')')])
      .map(([open, pattern, closed]) => pattern)
  ])
    .map(inner => new constructors.Multiplicand(inner)),

  mult: seq([ref('multiplicand'), ref('multiplier')])
    .map(([multiplicand, multiplier]) => new constructors.Mult(multiplicand, multiplier)),

  anchor: or([
    fixed('^').map(() => new constructors.Anchor(false)),
    fixed('$').map(() => new constructors.Anchor(true))
  ]),

  term: or([
    ref('mult'),
    ref('anchor')
  ])
    .map(inner => new constructors.Term(inner)),

  conc: ref('term').star()
    .map(terms => constructors.conc(terms)),

  pattern: ref('conc').plus(fixed('|'))
    .map(concs => constructors.pattern(concs))
}))
