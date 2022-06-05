import * as constructors from './constructors.js'

// Here's the hard rule: a reducer MUST return the same type of object.
// E.g. a pattern reducer may NOT return a charclass. It must return
// a pattern. However, a multiplicand reducer MAY return a new multiplicand
// object whose inner object is a charclass, not a pattern.

export const reduce = thing => {
  if (
    thing instanceof constructors.Charclass ||
    thing instanceof constructors.Multiplicand ||
    thing instanceof constructors.Mult ||
    thing instanceof constructors.Term ||
    thing instanceof constructors.Conc ||
    thing instanceof constructors.Pattern
  ) {
    return thing.reduced()
  }

  return {
  }[thing.type](thing)
}

/*
  conc
    (ab|cd|ef|)g to (ab|cd|ef)?g
    ab?b?c to ab{0,2}c
  pattern
    abc|ade to a(bc|de)
    xyz|stz to (xy|st)z
    a{1,2}|a{3,4} to a{1,4}
*/
