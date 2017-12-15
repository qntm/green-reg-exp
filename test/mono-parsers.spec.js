/* eslint-env jasmine */

'use strict'

const constructors = require('../src/constructors.js')
const monoParsers = require('../src/mono-parsers.js')

describe('monoParsers', function () {
  describe('charclass', function () {
    it('works', function () {
      expect(monoParsers.charclass('a')).toEqual(constructors.charclass(['a'], false))
    })
  })

  describe('mult', function () {
    it('works', function () {
      expect(monoParsers.mult('a')).toEqual(constructors.mult(
        constructors.multiplicand(
          constructors.charclass(['a'], false)
        ),
        constructors.multiplier(1, 1)
      ))
    })

    it('works better', function () {
      expect(monoParsers.mult('[a-g]+')).toEqual(constructors.mult(
        constructors.multiplicand(
          constructors.charclass(['a', 'b', 'c', 'd', 'e', 'f', 'g'], false)
        ),
        constructors.multiplier(1, Infinity)
      ))
      expect(monoParsers.mult('[a-g0-8$%]+')).toEqual(constructors.mult(
        constructors.multiplicand(
          constructors.charclass([
            'a', 'b', 'c', 'd', 'e', 'f', 'g',
            '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '$', '%'
          ], false)
        ),
        constructors.multiplier(1, Infinity)
      ))
      expect(monoParsers.mult('[a-g0-8$%\\^]+')).toEqual(constructors.mult(
        constructors.multiplicand(
          constructors.charclass([
            'a', 'b', 'c', 'd', 'e', 'f', 'g',
            '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '$', '%', '^'
          ], false)
        ),
        constructors.multiplier(1, Infinity)
      ))
    })
  })

  describe('conc', function () {
    it('works', function () {
      expect(monoParsers.conc('a')).toEqual(constructors.conc([
        constructors.term(
          constructors.mult(
            constructors.multiplicand(
              constructors.charclass(['a'], false)
            ),
            constructors.multiplier(1, 1)
          )
        )
      ]))
    })
  })

  describe('pattern', function () {
    it('works', function () {
      expect(monoParsers.pattern('a')).toEqual(constructors.pattern([
        constructors.conc([
          constructors.term(
            constructors.mult(
              constructors.multiplicand(
                constructors.charclass(['a'], false)
              ),
              constructors.multiplier(1, 1)
            )
          )
        ])
      ]))
    })

    it('handles an empty thing', function () {
      expect(monoParsers.pattern('()')).toEqual(constructors.pattern([
        constructors.conc([
          constructors.term(
            constructors.mult(
              constructors.multiplicand(
                constructors.pattern([
                  constructors.conc([])
                ])
              ),
              constructors.multiplier(1, 1)
            )
          )
        ])
      ]))
    })

    it('handles a big one', function () {
      expect(monoParsers.pattern('abc|def(ghi|jkl)')).toEqual(constructors.pattern([
        constructors.conc([
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['a'], false)), constructors.multiplier(1, 1))),
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['b'], false)), constructors.multiplier(1, 1))),
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['c'], false)), constructors.multiplier(1, 1)))
        ]),
        constructors.conc([
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['d'], false)), constructors.multiplier(1, 1))),
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['e'], false)), constructors.multiplier(1, 1))),
          constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['f'], false)), constructors.multiplier(1, 1))),
          constructors.term(constructors.mult(
            constructors.multiplicand(
              constructors.pattern([
                constructors.conc([
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['g'], false)), constructors.multiplier(1, 1))),
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['h'], false)), constructors.multiplier(1, 1))),
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['i'], false)), constructors.multiplier(1, 1)))
                ]),
                constructors.conc([
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['j'], false)), constructors.multiplier(1, 1))),
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['k'], false)), constructors.multiplier(1, 1))),
                  constructors.term(constructors.mult(constructors.multiplicand(constructors.charclass(['l'], false)), constructors.multiplier(1, 1)))
                ])
              ])
            ),
            constructors.multiplier(1, 1)
          ))
        ])
      ]))
    })
  })
})
