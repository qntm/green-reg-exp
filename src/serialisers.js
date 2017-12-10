'use strict'

const escapesBracket = require('./escapes-bracket')
const escapesRegular = require('./escapes-regular')

const bracketEscape = chars => {
  const runs = []
  chars.forEach(chr => {
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

const regularEscape = chars =>
  escapesRegular[chars[0]] || chars[0]

const serialisers = {
  charclass: ({chars, negated}) =>
    JSON.stringify(chars) === JSON.stringify([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
      'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
      'X', 'Y', 'Z', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ]) ? (negated ? '\\W' : '\\w')

    : JSON.stringify(chars) === JSON.stringify([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ]) ? (negated ? '\\D' : '\\d')

    : JSON.stringify(chars) === JSON.stringify([
      '\t', '\n', '\v', '\f', '\r', ' '
    ]) ? (negated ? '\\S' : '\\s')

    : (chars.length === 0 && negated) ? '.'

    // e.g. [^a]
    : negated ? '[^' + bracketEscape(chars) + ']'

    // single character, not contained inside square brackets.
    : chars.length === 1 ? regularEscape(chars)

    // multiple characters (or possibly 0 characters)
    : '[' + bracketEscape(chars) + ']',

  multiplier: ({lower, upper}) =>
    lower === 0 && upper === 1 ? '?'
    : lower === 1 && upper === 1 ? ''
    : lower === 0 && upper === Infinity ? '*'
    : lower === 1 && upper === Infinity ? '+'
    : lower === upper ? '{' + String(lower) + '}'
    : upper === Infinity ? '{' + String(lower) + ',}'
    : '{' + String(lower) + ',' + String(upper) + '}',

  multiplicand: multiplicand =>
    multiplicand.type === 'pattern' ? '(' + serialisers.pattern(multiplicand) + ')'
    : serialisers.charclass(multiplicand),

  mult: ({multiplicand, multiplier}) =>
    serialisers.multiplicand(multiplicand) + serialisers.multiplier(multiplier),

  conc: ({mults}) =>
    mults.map(serialisers.mult).join(''),

  pattern: ({concs}) => {
    if (concs.length === 0) {
      throw Error("Can't serialise 0 concs")
    }
    return concs.map(serialisers.conc).join('|')
  }
}

module.exports = serialisers
