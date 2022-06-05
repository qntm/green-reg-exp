import * as constructors from './constructors.js'

export const serialise = thing => {
  if (thing instanceof constructors.Charclass) {
    return thing.serialise()
  }

  return {
    multiplier: ({ lower, upper }) =>
      lower === 0 && upper === 1
        ? '?'
        : lower === 1 && upper === 1
          ? ''
          : lower === 0 && upper === Infinity
            ? '*'
            : lower === 1 && upper === Infinity
              ? '+'
              : lower === upper
                ? '{' + String(lower) + '}'
                : upper === Infinity
                  ? '{' + String(lower) + ',}'
                  : '{' + String(lower) + ',' + String(upper) + '}',

    multiplicand: ({ inner }) =>
      inner.type === 'pattern'
        ? '(' + serialise(inner) + ')'
        : serialise(inner),

    anchor: ({ end }) =>
      end ? '$' : '^',

    mult: ({ multiplicand, multiplier }) =>
      serialise(multiplicand) + serialise(multiplier),

    term: ({ inner }) =>
      serialise(inner),

    conc: ({ terms }) =>
      terms.map(serialise).join(''),

    pattern: ({ concs }) => {
      if (concs.length === 0) {
        return '[]'
      }
      return concs.map(serialise).join('|')
    }
  }[thing.type](thing)
}
