'use strict'

const equals = require('./equals')
const constructors = require('./constructors')
const serialise = require('./serialise')
const arrayOps = require('./array-ops')
const matchesEmptyString = require('./matches-empty-string')

// A pattern will contain anchors at potentially
// any level. We need to lift them up somehow.
// E.g. /abc(^$|def|ghi)jkl|mno/ becomes /abc^$jkl|abc(def|ghi)jkl|mno/
// This is NIGHTMARISHLY complex code, sorry
// It has to handle cases like /(^|A)($|B)/ and nesting... but it DOES IT!!!
const upliftAnchors = pattern => {
  const newConcs = []

  pattern.concs.forEach(conc => {
    const termArrayses = []
    for (let i = 0; i < conc.terms.length; i++) {
      const term = conc.terms[i]
      const termArrays = []
      if (
        term.inner.type === 'mult'
        && term.inner.multiplicand.inner.type === 'pattern'
      ) {
        const pattern2 = upliftAnchors(term.inner.multiplicand.inner)
        const concsWithNoAnchors = []
        pattern2.concs.forEach(conc => {
          if (conc.terms.some(term => term.inner.type === 'anchor')) {
            termArrays.push(conc.terms)
          } else {
            concsWithNoAnchors.push(conc)
          }
        })
        if (concsWithNoAnchors.length > 0) {
          if (concsWithNoAnchors.length === 1) {
            termArrays.push(concsWithNoAnchors[0].terms)
          } else {
            termArrays.push([constructors.term(
              constructors.mult(
                constructors.multiplicand(
                  constructors.pattern(concsWithNoAnchors)
                ),
                constructors.multiplier(1, 1)
              )
            )])
          }
        }
      } else {
        termArrays.push([term])
      }
      termArrayses.push(termArrays)
    }

    // Now each possible combination of choices of terms from
    // `termArrayses` needs to be turned into a `conc`.
    arrayOps.product(...termArrayses).forEach(termArrays => {
      const terms = Array.prototype.concat.apply([], termArrays)
      newConcs.push(constructors.conc(terms))
    })
  })

  return constructors.pattern(newConcs)
}

const nothing = constructors.conc([
  constructors.term(
    constructors.mult(
      constructors.multiplicand(
        constructors.charclass([], false)
      ),
      constructors.multiplier(1, 1)
    )
  )
])

// It is assumed that the conc being passed in is from a pattern
// which has already undergone the `upliftAnchors` processing.
const deAnchorConc = conc => {
  // *cracks knuckles*
  let indexOfLastStartAnchor = -1
  for (let i = 0; i < conc.terms.length; i++) {
    if (conc.terms[i].inner.type === 'anchor' && conc.terms[i].inner.end === false) {
      indexOfLastStartAnchor = i
    }
  }

  let indexOfFirstEndAnchor = conc.terms.length
  for (let i = conc.terms.length - 1; i >= 0; i--) {
    if (conc.terms[i].inner.type === 'anchor' && conc.terms[i].inner.end === true) {
      indexOfFirstEndAnchor = i
    }
  }

  // Everything up to the last start anchor must match the empty string
  // otherwise this isn't happening
  // e.g. input is /aaa^/
  if (
    !conc.terms.slice(0, indexOfLastStartAnchor + 1)
      .filter(term => term.inner.type !== 'anchor')
      .every(matchesEmptyString)
  ) {
    return nothing
  }

  // Everything from the last end anchor to the end must also match
  // the empty string or again this isn't happening
  // e.g. input is /$bbb/
  if (
    !conc.terms.slice(indexOfFirstEndAnchor, conc.terms.length)
      .filter(term => term.inner.type !== 'anchor')
      .every(matchesEmptyString)
  ) {
    return nothing
  }

  // e.g. input is /$a{0,4}^/, return //
  if (indexOfFirstEndAnchor < indexOfLastStartAnchor) {
    return constructors.conc([])
  }

  const terms = conc.terms.slice(indexOfLastStartAnchor + 1, indexOfFirstEndAnchor)

  const dotStarTerm = constructors.term(
    constructors.mult(
      constructors.multiplicand(
        constructors.charclass([], true)
      ),
      constructors.multiplier(0, Infinity)
    )
  )

  // Put /.*/ at the beginning and end of the thing if need be
  if (indexOfLastStartAnchor === -1) {
    terms.unshift(dotStarTerm)
  }
  if (indexOfFirstEndAnchor === conc.terms.length) {
    terms.push(dotStarTerm)
  }

  return constructors.conc(terms)
}

const deAnchorPattern = pattern =>
  constructors.pattern(
    upliftAnchors(pattern).concs
      .map(deAnchorConc)
      .filter(conc => !equals(conc, nothing))
  )

module.exports = {deAnchorPattern, deAnchorConc, upliftAnchors}
