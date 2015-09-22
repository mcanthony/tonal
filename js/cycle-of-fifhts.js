(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var d3 = window.d3
var chord = require('tonal/chord/chord')
var scale = require('tonal/scale/scale')
var scaleNames = require('tonal/scale/scaleNames')
var chordNames = require('tonal/chord/chordNames')
var fifthsFrom = require('tonal/fifths/fifthsFrom')

var R = 50
var MARGIN = 10
var SIZE = 2 * (R + MARGIN)

var lineFunction = d3.svg.line()
  .x(function (angle) {
    return R + Math.cos(angle) * R
  }).y(function (angle) {
    return R + Math.sin(angle) * R
  }).interpolate('linear-closed')

function angle (index) {
  return ((index + 15) % 12) * (Math.PI * 2 / 12)
}

chordNames().sort().map(paint('#chords', chord))
scaleNames().sort().map(paint('#scales', scale))

function paint (element, type) {
  return function (name) {
    var svg = d3.select(element).append('svg')
    .attr('width', SIZE).attr('height', SIZE + 20).attr('transform', 'translate(20, 20)')

    svg.append('circle').attr('cx', R).attr('cy', R).attr('r', R)
    .style('fill', 'rgba(0,0,0,0.03)')

    var steps = type('C ' + name).map(fifthsFrom()).map(angle).sort()
    //steps.push(steps[0])

    svg.append('path').attr('d', lineFunction(steps))
    .attr('stroke', 'blue').attr('stroke-width', 2).attr('fill', 'rgba(0,0,200,0.2)')

    svg.append('text').attr('x', 50).attr('y', 120).attr('font-size', 12)
      .attr('text-anchor', 'middle').text(name)

    svg.on('click', function () {
      console.log(name, type('C ' + name), type('C ' + name).map(fifthsFrom()))
    })
  }
}

},{"tonal/chord/chord":9,"tonal/chord/chordNames":10,"tonal/fifths/fifthsFrom":14,"tonal/scale/scale":22,"tonal/scale/scaleNames":23}],2:[function(require,module,exports){
/**
 * Internal function: ensures the param is a string by sending the `name`
 * property if it's an object
 *
 * It allows parse to be called on itself:
 * `parse(parse(parse('C3')))`
 *
 * @api private
 */
function coerce (name, func) {
  return function (param) {
    if (!param) return null
    else if (param[name]) return func(param[name])
    else if (typeof param === 'string') return func(param)
    else return null
  }
}

module.exports = coerce

},{}],3:[function(require,module,exports){
/**
 * Simplest and fastest memoize function I can imagine
 *
 * This is in base of two restrictive asumptions:
 * - the function only receives __one paramater__
 * - the parameter __is a string__
 *
 * For a more complete memoize solution see:
 * https://github.com/addyosmani/memoize.js
 *
 * @api private
 * @param {Function} func - the function to memoize
 * @return {Function} A memoized function
 */
function memoize (func) {
  var cache = {}
  return function (str) {
    return (str in cache) ? cache[str] : cache[str] = func(str)
  }
}
module.exports = memoize

},{}],4:[function(require,module,exports){
'use strict'

/*
 * Get the keys of two hash concatenated
 *
 * Used by scales and chords
 * @see scale/names
 * @see chord/names
 */
module.exports = function (data, aliases) {
  var keys = null
  return function () {
    keys = keys || Object.keys(data).concat(Object.keys(aliases))
    return keys
  }
}

},{}],5:[function(require,module,exports){
'use strict'

/**
 * Create a lookup function for two hash maps, the real data and aliases.
 *
 * Used by scales and chords
 */
function lookup (data, aliases) {
  return function (name) {
    var value = (data[name] || data[aliases[name]])
    return value ? value.split(' ') : null
  }
}

module.exports = lookup

},{}],6:[function(require,module,exports){
/**
 * Force a value to be required and throws an exception if not
 *
 * @example
 * require(interval('m2'), 'Interval not valid: ', 'm2')
 * @api private
 */
function required (value, error, cause) {
  if (value) return value
  else throw Error(error + cause)
}

module.exports = required

},{}],7:[function(require,module,exports){
'use strict'

var SEP = /\s*\|\s*|\s*,\s*|\s+/
/**
 * Return an array of the given source. If the source is an array, return it
 * unaltered. If its an string, split it and anything else is wrapped to an array.
 *
 * @param {Array|String|Object} source - the source
 * @return {Array} an array
 *
 * @example
 * // a toArray is an array of events
 * toArray(['A', 'B', 'C']) // => ['A', 'B', 'C']
 * toArray('A B C') // => ['A', 'B', 'C']
 * toArray('A | b | C') // => ['A', 'B', 'C']
 * toArray('A , b , C') // => ['A', 'B', 'C']
 * toArray(2) // => [ 2 ]
 */
function toArray (source) {
  if (Array.isArray(source)) return source
  else if (typeof source === 'string') return source.split(SEP).filter(empty)
  else return [ source ]
}
function empty (e) { return e !== '' }

module.exports = toArray

},{}],8:[function(require,module,exports){
module.exports={
  "2": "Madd9",
  "6": "M6",
  "67": "7add6",
  "69": "M69",
  "Major": "M",
  "minor": "m",
  "minor7": "m7",
  "Dominant": "7",
  "augmented": "M#5",
  "diminished": "o7",
  "half-diminished": "m7b5",
  "quartal": "4",
  "": "M",
  "M6b5": "M6#11",
  "6#11": "M6#11",
  "6b5": "M6#11",
  "add9": "Madd9",
  "add9no3": "Msus2",
  "sus": "Msus4",
  "sus2": "Msus2",
  "add2": "Madd9",
  "sus4add9": "sus24",
  "maj7": "Maj7",
  "M7": "Maj7",
  "maj9": "M9",
  "Maj9": "M9",
  "maj7#11": "M7#11",
  "Maj7#11": "M7#11",
  "maj9#11": "M9#11",
  "Maj9#11": "M9#11",
  "maj13": "M13",
  "Maj13": "M13",
  "maj13#11": "M13#11",
  "Maj13#11": "M13#11",
  "sus4": "Msus4",
  "susb9": "7sus4b9",
  "7susb9": "7sus4b9",
  "7b9sus": "7sus4b9",
  "7b9sus4": "7sus4b9",
  "phryg": "7sus4b9",
  "maj#5": "M#5",
  "Maj#5": "M#5",
  "maj7#5": "M7#5",
  "Maj7#5": "M7#5",
  "maj9#5": "M7#5",
  "Maj9#5": "M9#5",
  "+": "M#5",
  "aug": "M#5",
  "M7+": "M7#5",
  "+add9": "M#5add9",
  "mMaj7": "mM7",
  "mMaj9": "mM9",
  "mMaj7b6": "mM7b6",
  "mMaj9b6": "mM9b6",
  "m7add4": "m7add11",
  "h7": "m7b5",
  "mb5": "o",
  "m6b5": "o7",
  "h9": "m9b5",
  "h11": "m11b5",
  "m+": "m#5",
  "mb6": "m#5",
  "+7": "7#5",
  "7+": "7#5",
  "7aug": "7#5",
  "aug7": "7#5",
  "7b5#9": "7#9#11",
  "9+": "9#5",
  "7add13": "7add6",
  "9b5b13": "9#11b13",
  "7sus": "7sus4",
  "9sus": "9sus4",
  "7b9b13sus4": "7sus4b9b13",
  "13sus": "13sus4",
  "7b9#11b13": "7b9b13#11",
  "7b5b9": "7b9#11",
  "7b5b13": "7#11b13",
  "7b5b9b13": "7b9b13#11",
  "7alt": "7#5#9",
  "dim": "o",
  "dim7": "o7",
  "-": "m7",
  "-7": "m7",
  "-9": "m9",
  "-11": "m11",
  "-13": "m13",
  "-7b5": "m7b5",
  "-9b5": "m9b5",
  "-11b5": "m11b5",
  "-6": "m6",
  "-69": "m69",
  "-M7": "mM7",
  "-M9": "mM9",
  "7+4": "7#11",
  "7#4": "7#11",
  "9+4": "9#11",
  "9#4": "9#11",
  "13+4": "13#11",
  "13#4": "13#11",
  "M7+4": "M7#11",
  "M7#4": "M7#11",
  "M9+4": "M9#11",
  "M9#4": "M9#11",
  "M13+4": "M13#11",
  "M13#4": "M13#11",
  "7_": "7",
  "9_": "9",
  "13_": "13",
  "7#11_": "7#11",
  "9#11_": "9#11",
  "13#11_": "13#11",
  "7#4_": "7#11",
  "9#4_": "9#11",
  "13#4_": "13#11",
  "13#9_": "13#9",
  "7#9_": "7#9",
  "7#5#9_": "7#5#9",
  "7#9b13_": "7#5#9"
}

},{}],9:[function(require,module,exports){
'use strict'

var harmonize = require('../interval/harmonize')
var generic = require('./intervals')
var TONIC = /^\s*([a-gA-G])(#{1,4}|b{1,4}|x{1,2}|)(.*)$/

/**
 * Get chord notes or intervals by its type and (optionally) tonic pitch
 *
 * @param {String} name - the chord name (may include the tonic)
 * @param {String} tonic - (Optional) the tonic pitch
 * @return {Array} an array of intervals or notes (if the tonic is provided)
 *
 * @example
 * chord('CMaj7') // => ['C4', 'E4', 'G4', 'B4']
 * chord('7b5') // => ['1P', '3M', '5d', '7m']
 * chord('7b5', 'Bb2')
 */
function chord (name, tonic) {
  var intervals = generic(name)
  if (intervals) return tonic ? harmonize(tonic, intervals) : intervals

  var split = TONIC.exec(name)
  if (!split) return null
  return chord(split[3].trim(), tonic || split[1] + split[2])
}

module.exports = chord

},{"../interval/harmonize":15,"./intervals":12}],10:[function(require,module,exports){
'use strict'

var keys = require('../_internal/keys')
var scales = require('./chords.json')
var aliases = require('./aliases.json')

/**
 * Get all known scale names
 *
 * @name chordNames
 * @module scale
 *
 * @return {Array} array with all the known names
 *
 * @example
 * names() => ['major', 'minor', ....]
 */
module.exports = keys(scales, aliases)

},{"../_internal/keys":4,"./aliases.json":8,"./chords.json":11}],11:[function(require,module,exports){
module.exports={
  "4": "1P 4P 7m 3m",
  "5": "1P 5P",
  "7": "1P 3M 5P 7m",
  "9": "1P 3M 5P 7m 2M",
  "10": "1P 5P 3M",
  "11": "1P 5P 7m 2M 4P",
  "13": "1P 3M 5P 7m 2M 6M",
  "M": "1P 3M 5P",
  "M6": "1P 3M 5P 6M",
  "M69": "1P 3M 5P 6M 2M",
  "M6#11": "1P 3M 5P 6M 4A",
  "M69#11": "1P 3M 5P 6M 2M 4A",
  "Madd9": "1P 3M 5P 2M",
  "Msus2": "1P 2M 5P",
  "sus24": "1P 2M 4P 5P",
  "Maj7": "1P 3M 5P 7M",
  "M9": "1P 3M 5P 7M 2M",
  "M7#11": "1P 3M 5P 7M 4A",
  "M9#11": "1P 3M 5P 7M 2M 4A",
  "M13": "1P 3M 5P 7M 2M 6M",
  "M7add13": "1P 3M 5P 6M 7M 2M",
  "M13#11": "1P 3M 5P 7M 2M 4A 6M",
  "69#11": "1P 3M 5P 6M 2M 4A",
  "Mb5": "1P 3M 5d",
  "M7b5": "1P 3M 5d 7M",
  "M9b5": "1P 3M 5d 7M 2M",
  "M7#9#11": "1P 3M 5P 7M 2A 4A",
  "Msus4": "1P 4P 5P",
  "M7b6": "1P 3M 6m 7M",
  "9no5": "1P 3M 7m 2M",
  "M#5": "1P 3M 5A",
  "M7#5": "1P 3M 5A 7M",
  "M9#5": "1P 3M 5A 7M 2M",
  "M#5add9": "1P 3M 5A 2M",
  "M7sus4": "1P 4P 5P 7M",
  "M9sus4": "1P 4P 5P 7M 2M",
  "M7#5sus4": "1P 4P 5A 7M",
  "M9#5sus4": "1P 4P 5A 7M 2M",
  "+add#9": "1P 3M 5A 2A",
  "M7b9": "1P 3M 5P 7M 2m",
  "Mb6": "1P 3M 6m",
  "m": "1P 3m 5P",
  "m7": "1P 3m 5P 7m",
  "m6": "1P 3m 4P 5P 6M",
  "m69": "1P 3m 5P 6M 2M",
  "madd9": "1P 3m 5P 2M",
  "madd4": "1P 3m 4P 5P",
  "mM7": "1P 3m 5P 7M",
  "mM9": "1P 3m 5P 7M 2M",
  "mM7b6": "1P 3m 5P 6m 7M",
  "mM9b6": "1P 3m 5P 6m 7M 2M",
  "m9": "1P 3m 5P 7m 2M",
  "m11": "1P 3m 5P 7m 2M 4P",
  "m7add11": "1P 3m 5P 7m 4P",
  "m13": "1P 3m 5P 7m 2M 4P 6M",
  "m7b5": "1P 3m 5d 7m",
  "m9b5": "1P 3m 7m 5d 2M",
  "m11b5": "1P 3m 7m 5d 2M 4P",
  "m#5": "1P 3m 5A",
  "mb6b9": "1P 3m 6m 2m",
  "mb6M7": "1P 3m 6m 7M",
  "m7#5": "1P 3m 6m 7m",
  "m9#5": "1P 3m 6m 7m 2M",
  "m11#5": "1P 3m 6m 7m 2M 4P",
  "addb9": "1P 3M 5P 2m",
  "7no5": "1P 3M 7m",
  "7b9": "1P 3M 5P 7m 2m",
  "7b9#9": "1P 3M 5P 7m 2m 2A",
  "7#5": "1P 3M 5A 7m",
  "7#9": "1P 3M 5P 7m 2A",
  "7#11": "1P 3M 5P 7m 4A",
  "7#9#11": "1P 3M 5P 7m 2A 4A",
  "7#9b13": "1P 3M 5P 7m 2A 6m",
  "7#9#11b13": "1P 3M 5P 7m 2A 4A 6m",
  "7b5": "1P 3M 5d 7m",
  "9#11": "1P 3M 5P 7m 2M 4A",
  "9b5": "1P 3M 5d 7m 2M",
  "9#5": "1P 3M 5A 7m 2M",
  "9#5#11": "1P 3M 5A 7m 2M 4A",
  "11b9": "1P 5P 7m 2m 4P",
  "7add6": "1P 3M 5P 7m 6M",
  "13no5": "1P 3M 7m 2M 6M",
  "7b13": "1P 3M 7m 6m",
  "7b6": "1P 3M 5P 6m 7m",
  "9b13": "1P 3M 7m 2M 6m",
  "7#11b13": "1P 3M 5P 7m 4A 6m",
  "9#11b13": "1P 3M 5P 7m 2M 4A 6m",
  "13b9": "1P 3M 5P 7m 2m 6M",
  "13b5": "1P 3M 5d 6M 7m 2M",
  "13#9": "1P 3M 5P 7m 2A 6M",
  "13#11": "1P 3M 5P 7m 2M 4A 6M",
  "13#9#11": "1P 3M 5P 7m 2A 4A 6M",
  "7sus4": "1P 4P 5P 7m",
  "9sus4": "1P 4P 5P 7m 2M",
  "7#5sus4": "1P 4P 5A 7m",
  "7sus4b9": "1P 4P 5P 7m 2m",
  "7sus4b9b13": "1P 4P 5P 7m 2m 6m",
  "13sus4": "1P 4P 5P 7m 2M 6M",
  "7b9#11": "1P 3M 5P 7m 2m 4A",
  "13b9#11": "1P 3M 5P 7m 2m 4A 6M",
  "7b9b13": "1P 3M 5P 7m 2m 6m",
  "7b9b13#11": "1P 3M 5P 7m 2m 4A 6m",
  "7#5b9": "1P 3M 5A 7m 2m",
  "7#5b9#11": "1P 3M 5A 7m 2m 4A",
  "7#5#9": "1P 3M 5A 7m 2A",
  "o": "1P 3m 5d",
  "o7": "1P 3m 5d 6M",
  "oM7": "1P 3m 5d 7M",
  "o7M7": "1P 3m 5d 6M 7M",
  "Blues": "1P 3m 4P 5d 5P 7m",
  "m10": "1P 5P 3m"
}

},{}],12:[function(require,module,exports){
'use strict'

var lookup = require('../_internal/lookup')
var data = require('./chords.json')
var aliases = require('./aliases.json')

/**
 * Get the intervals of a chord name
 *
 * @param {String} name - the chord name
 * @return {Array} the intervals or null if not found
 *
 * @example
 * intervals('Cmaj7') // => ['1P', '3M', '5P', '7M']
 */
module.exports = lookup(data, aliases)

},{"../_internal/lookup":5,"./aliases.json":8,"./chords.json":11}],13:[function(require,module,exports){
'use strict'

var props = require('../pitch/props')
var LINE = 'FCGDAEB'

/**
 * Return the number of fifths between two pitch classes.
 *
 * @param {String} pitch - the pitch to calc the fifths distance to
 * @param {String} from - (Optional) the pitch to calc the fifths distance from
 * (C if not specified)
 * @return {Integer} the number fifths between the two pitches
 *
 * @example
 * fifths('C') // => 0
 * fifths('G') // => 1
 * fifths('D') // => 2
 * fifths('F') // => -1
 * fifths('Bb') // => -2
 * fifths('A', 'D') // => 1
 * fifths('C4', 'C2') // => 0
 */
function fifths (pitch, from) {
  pitch = props(pitch)
  if (pitch === null) return null
  var mod = props(from) ? fifths(from) : 0

  var alter = pitch.alter * 7
  return LINE.indexOf(pitch.letter) + alter - mod - 1
}

module.exports = fifths

},{"../pitch/props":18}],14:[function(require,module,exports){
'use strict'

var fifths = require('./fifths')

/**
 * Create a function to get fifths distance from a given note. Suited for
 * using with arrays of notes
 *
 * @param {String} from - the from note of the fifths distance
 * @return {function} the functtion to calculate distances
 *
 * @example
 * ['A', 'B', 'C'].map(fifthsFrom('G'))
 *
 */
function fifthsFrom (from) {
  return function (to) {
    return fifths(to, from)
  }
}

module.exports = fifthsFrom

},{"./fifths":13}],15:[function(require,module,exports){
'use strict'

var toArray = require('../_internal/toArray')
var transpose = require('../pitch/transpose')

/**
 * Given a collection of intervals, and a tonic create a collection of pitches
 *
 * @param {String} tonic - the tonic
 * @param {String|Array} intervals - a collection of intervals
 * @param {boolean} pitchClassOnly - if true, the returned pitches don't include
 * octave information
 * @return {Array} a collection of pitches
 *
 * @example
 * harmonize('C2', ['P1 P5']) // => ['C2', 'G2']
 */
function harmonize (tonic, intervals, pitchClassOnly) {
  var pitches = toArray(intervals).map(transpose(tonic))
  return pitchClassOnly ? pitches.map(pitchClass) : pitches
}

function pitchClass (pitch) { return pitch.slice(0, -1) }

module.exports = harmonize

},{"../_internal/toArray":7,"../pitch/transpose":19}],16:[function(require,module,exports){
'use strict'

var REGEX = /^([-+]?)(\d+)(dd|d|m|M|P|A|AA)$/
// size in semitones to generic semitones in non altered state
// last 0 is beacuse 8P is oct = 1
var SEMITONES = [null, 0, 2, 4, 5, 7, 9, 11, 0]
// alteration values
var ALTERS = {
  P: { dd: -2, d: -1, P: 0, A: 1, AA: 2 },
  M: { dd: -3, d: -2, m: -1, M: 0, A: 1, AA: 2 }
}

/**
 * Get interval properties
 *
 * This method retuns an object with the following properties:
 * - name: the interval name
 * - quality: the quality (one of `dmPMA` for dimished, minor, perfect, major and
 * augmented respectively)
 * - num: diatonic number (a positive integer bigger that 0)
 * - alter: an integer with the alteration respect to 'P' or 'M' (depending on the type)
 * - dir: direction, 1 for ascending intervals, -1 for descending ones
 * - oct: the number of octaves (a positive integer)
 * - type: the interval type. 'P' for 'perfect', 'M' for major. This is not the
 * quality of the interval, just if it is perfectable or not.
 * - semitones: the size of the interval in semitones
 *
 * @param {String} name - the name of the interval to be propsd
 * @return {Array} a interval object or null if not a valid interval
 *
 * @example
 * var props = require('tonal/interval/props')
 * props('-5P') // => { name: '-5P', quality: 'P', dir: -1, num: 5, generic: 4, alter: 0, perfectable: true }
 * props('9m') // => { name: '9m', quality: 'm', dir: 1, num: 9, generic: 1, alter: -1, perfectable: false }
 */
function props (interval) {
  var m = REGEX.exec(interval)
  if (!m) return null // not valid interval

  var num = +m[2]
  if (num === 0) return null

  var q = m[3]
  var dir = m[1] === '-' ? -1 : 1
  var simple = num > 8 ? (num % 7 || 7) : num
  var type = (simple === 1 || simple === 4 || simple === 5 || simple === 8) ? 'P' : 'M'
  if (q === 'M' && type === 'P' || q === 'P' && type !== 'P') return null
  var alt = ALTERS[type][q]
  if (alt == null) return null
  var oct = Math.floor((num - 1) / 7)
  var semitones = dir * ((SEMITONES[simple] + alt) + 12 * oct)

  return Object.freeze({ name: m[0], quality: q, dir: dir, num: num, simple: simple,
    perfectable: type === 'P', oct: oct, alter: alt,
    semitones: semitones, type: type })
}

var memoize = require('../_internal/fastMemoize')
var coerce = require('../_internal/coerceParam')
module.exports = coerce('name', memoize(props))

},{"../_internal/coerceParam":2,"../_internal/fastMemoize":3}],17:[function(require,module,exports){
var props = require('./props')

var ACCIDENTALS = { '-4': 'bbbb', '-3': 'bbb', '-2': 'bb', '-1': 'b',
  0: '', 1: '#', 2: '##', 3: '###', 4: '####'}

/**
 * Get the scientific notation of a pitch (and optionally change its octave and alteration)
 *
 * @param {String} pitch - a pitch, a pitch class or a pitch letter
 * @param {String|Integer} alteration - (Optional) the alteration number
 * (overrides the one from the pitch string). Can be null to avoid overrides
 * @param {Integer} octave - (Optional) the octave (overrides the one from the pitch string)
 * @return {String} the pitch in scientific notation or null if not valid pitch
 *
 * @example
 * pitch('c', '#', 2) // => 'C#2'
 * pitch('c', '#') // => 'C#4'
 * pitch('c') // => 'C4'
 * pitch('c#4') // => 'C#4'
 * pitch('C#4', 'b', 2) // => 'Cb2'
 * pitch('C#4', null, 2) // => 'C#2'
 * pitch('C7', -1) // => 'Cb7'
 * pitch('bluf') // => null
 */
function pitch (pitch, acc, oct) {
  pitch = props(pitch)
  if (!pitch) return null
  if (arguments.length === 1) return pitch.str

  oct = oct ? oct : pitch.oct

  if (!acc) acc = pitch.acc
  else if (acc > -5 && acc < 5) acc = ACCIDENTALS[acc]
  else if (/^#{0,4}$/.test(acc) || /^b{0,4}$/.test(acc)) acc = acc
  else return null

  // if not valid acc parameter return null
  if (acc === null) return null

  return pitch.letter + acc + oct
}

module.exports = pitch

},{"./props":18}],18:[function(require,module,exports){
'use strict'

var REGEX = /^([a-gA-G])(#{1,4}|b{1,4}|x{1,2}|)(\d*)$/
var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Get pitch properties
 *
 * It returns an object with the following properties:
 *
 * - __name__: the given pitch string
 * - __letter__: the pitch letter __always__ in uppercase
 * - __str__: the pitch in scientific representation
 * - __pitchClass__: the pitch [pitch class](https://en.wikipedia.org/wiki/Pitch_class)
 * (letter in uppercase, accidentals using 'b' or '#', never 'x', no octave)
 * - __acc__: a string with the accidentals or '' if no accidentals (never null)
 * - __oct__: a integer with the octave. If not present in the pitch, is set to 4
 * - __alter__: the integer representic the accidentals (0 for no accidentals,
 * - __midi__: {Integer} the midi value
 * -1 for 'b', -2 for 'bb', 1 for '#', 2 for '##', etc...)
 * - __chroma__: {Integer} the pitch class interger value (between 0 and 11)
 * where C=0, C#=1, D=2...B=11
 *
 * @param {String} pitch - the pitch to get the properties from
 * @return {Object} an object with the pitch components or null if its not a valid pitch
 *
 * @example
 * props('C#2') // => { }
 */
function props (pitch) {
  var m = REGEX.exec(pitch)
  if (!m) return null

  var n = { name: m[0] }
  n.letter = m[1].toUpperCase()
  n.acc = m[2].replace(/x/g, '##')
  n.pitchClass = n.letter + n.acc
  n.oct = m[3] === '' ? 4 : +m[3]
  n.str = n.pitchClass + n.oct

  // numeric derived data
  n.alter = n.acc[0] === 'b' ? -n.acc.length : n.acc.length
  n.chroma = SEMITONES[n.letter] + n.alter
  n.midi = n.chroma + 12 * (n.oct + 1)
  return Object.freeze(n)
}

var memoize = require('../_internal/fastMemoize')
var coerce = require('../_internal/coerceParam')
module.exports = coerce('name', memoize(props))

},{"../_internal/coerceParam":2,"../_internal/fastMemoize":3}],19:[function(require,module,exports){
var required = require('../_internal/required')
var props = require('./props')
var pitch = require('./pitch')
var interval = require('../interval/props')

var LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/**
 * Transpose a pitch by an interval
 *
 * This is an _strict_ function: if pitch or interval are not valid, an exception
 * is thrown
 *
 * @param {String} pitch - the pitch to be transposed
 * @param {String} interval - (Optional) the interval. If not present, a partially
 * applied function with the pitch is returned
 * @return {String} the resulting pitch
 *
 * @example
 * transpose('E', 'M2') // => 'F#4'
 * transpose('C', 'M-2') // => 'Bb3'
 * ['M2', 'm3', 'P-8'].map(tranapose('C')) // => ['D4', 'Eb4', 'C3']
 * ['C', 'D', 'E'].map(transpose('M2')) // => ['D4', 'E4', 'F#4']
 */
function transpose (p, i) {
  if (arguments.length === 1) return partial(p)

  p = required(props(p), 'Note not valid: ', p)
  i = required(interval(i), 'Interval not valid: ', i)

  var oct = p.oct + i.dir * i.oct

  // if its a perfect octave, do a short path
  if (i.quality === 'P' && (i.simple === 8 || i.simple === 1)) {
    return p.pitchClass + oct
  }

  var letterIndex = LETTERS.indexOf(p.letter) + i.dir * (i.simple - 1)
  if (letterIndex > 6) {
    letterIndex = letterIndex % 7
    oct++
  } else if (letterIndex < 0) {
    letterIndex += 7
    oct--
  }
  var ref = props(pitch(LETTERS[letterIndex], 0, oct))
  return pitch(ref, i.semitones - (ref.midi - p.midi), oct)
}

function partial (arg) {
  return function (other) {
    if (/^-?\d/.test(arg)) return transpose(other, arg)
    else return transpose(arg, other)
  }
}

module.exports = transpose

},{"../_internal/required":6,"../interval/props":16,"./pitch":17,"./props":18}],20:[function(require,module,exports){
'use strict'

var lookup = require('../_internal/lookup')
var data = require('./scales.json')
var aliases = require('./scale-aliases.json')

/**
 * Get the intervals of a scale name (without tonic)
 *
 * @param {String} name - the scale name (without tonic)
 * @return {Array} the intervals or null if not found
 *
 * @name generic
 *
 * @example
 * generic('major') // => ['1P', '2M', '3M', '4P', '5P', '6M', '7M']
 */
module.exports = lookup(data, aliases)

},{"../_internal/lookup":5,"./scale-aliases.json":21,"./scales.json":24}],21:[function(require,module,exports){
module.exports={
  "dominant": "mixolydian",
  "super locrian": "altered",
  "diminished whole tone": "altered",
  "arabian": "locrian major",
  "ionian": "major",
  "minor": "aeolian",
  "pomeroy": "altered",
  "pentatonic": "major pentatonic",
  "minor seven flat five pentatonic": "locrian pentatonic",
  "chinese": "lydian pentatonic",
  "kumoi": "flat three pentatonic",
  "blues": "minor blues",
  "gypsy": "double harmonic major",
  "hindu": "melodic minor fifth mode",
  "indian": "mixolydian pentatonic",
  "dorian b2": "neopolitan major",
  "lydian b7": "lydian dominant",
  "mixolydian b6": "melodic minor fifth mode",
  "phrygian major": "spanish"
}

},{}],22:[function(require,module,exports){
'use strict'

var harmonize = require('../interval/harmonize')
var generic = require('./intervals')

/**
 * Get the scale (pitch set) of a scale name
 *
 * If the scale name does not contains the tonic, a list of intervals is returned
 *
 * @param {String} name - the scale name
 * @param {String} tonic - (Optional) the tonic
 * @return {Array} an array of intervals or notes (if tonic is present)
 *
 * @example
 * scale('C major') // => ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * scale('D diminished whole tone') // => [ 'D', 'Eb', 'F', 'F#', 'Ab', 'Bb', 'C' ]
 * scale('bebop') // => ['1P', '2M', '3M', '4P', '5P', '6M', '7m', '7M']
 */
function scale (name, tonic) {
  var intervals = generic(name)
  if (intervals) return tonic ? harmonize(tonic, intervals, true) : intervals

  var space = name.indexOf(' ')
  if (space < 0) return null
  return scale(name.slice(space + 1), tonic || name.slice(0, space))
}

module.exports = scale

},{"../interval/harmonize":15,"./intervals":20}],23:[function(require,module,exports){
'use strict'

var keys = require('../_internal/keys')
var scales = require('./scales.json')
var aliases = require('./scale-aliases.json')

/**
 * Get all known scale names
 *
 * @name scaleNames
 * @return {Array} array with all the known names
 *
 * @example
 * names() => ['major', 'minor', ....]
 */
module.exports = keys(scales, aliases)

},{"../_internal/keys":4,"./scale-aliases.json":21,"./scales.json":24}],24:[function(require,module,exports){
module.exports={
  "lydian": "1P 2M 3M 4A 5P 6M 7M",
  "major": "1P 2M 3M 4P 5P 6M 7M",
  "mixolydian": "1P 2M 3M 4P 5P 6M 7m",
  "dorian": "1P 2M 3m 4P 5P 6M 7m",
  "aeolian": "1P 2M 3m 4P 5P 6m 7m",
  "phrygian": "1P 2m 3m 4P 5P 6m 7m",
  "locrian": "1P 2m 3m 4P 5d 6m 7m",
  "melodic minor": "1P 2M 3m 4P 5P 6M 7M",
  "melodic minor second mode": "1P 2m 3m 4P 5P 6M 7m",
  "lydian augmented": "1P 2M 3M 4A 5A 6M 7M",
  "lydian dominant": "1P 2M 3M 4A 5P 6M 7m",
  "melodic minor fifth mode": "1P 2M 3M 4P 5P 6m 7m",
  "locrian #2": "1P 2M 3m 4P 5d 6m 7m",
  "locrian major": "1P 2M 3M 4P 5d 6m 7m",
  "altered": "1P 2m 3m 3M 5d 6m 7m",
  "major pentatonic": "1P 2M 3M 5P 6M",
  "lydian pentatonic": "1P 3M 4A 5P 7M",
  "mixolydian pentatonic": "1P 3M 4P 5P 7m",
  "locrian pentatonic": "1P 3m 4P 5d 7m",
  "minor pentatonic": "1P 3m 4P 5P 7m",
  "minor six pentatonic": "1P 3m 4P 5P 6M",
  "minor hexatonic": "1P 2M 3m 4P 5P 7M",
  "flat three pentatonic": "1P 2M 3m 5P 6M",
  "flat six pentatonic": "1P 2M 3M 5P 6m",
  "major flat two pentatonic": "1P 2m 3M 5P 6M",
  "whole tone pentatonic": "1P 3M 5d 6m 7m",
  "ionian pentatonic": "1P 3M 4P 5P 7M",
  "lydian #5 pentatonic": "1P 3M 4A 5A 7M",
  "lydian dominant pentatonic": "1P 3M 4A 5P 7m",
  "minor #7 pentatonic": "1P 3m 4P 5P 7M",
  "super locrian pentatonic": "1P 3m 4d 5d 7m",
  "in-sen": "1P 2m 4P 5P 7m",
  "iwato": "1P 2m 4P 5d 7m",
  "hirajoshi": "1P 2M 3m 5P 6m",
  "kumoijoshi": "1P 2m 4P 5P 6m",
  "pelog": "1P 2m 3m 5P 6m",
  "vietnamese 1": "1P 3m 4P 5P 6m",
  "vietnamese 2": "1P 3m 4P 5P 7m",
  "prometheus": "1P 2M 3M 4A 6M 7m",
  "prometheus neopolitan": "1P 2m 3M 4A 6M 7m",
  "ritusen": "1P 2M 4P 5P 6M",
  "scriabin": "1P 2m 3M 5P 6M",
  "piongio": "1P 2M 4P 5P 6M 7m",
  "major blues": "1P 2M 3m 3M 5P 6M",
  "minor blues": "1P 3m 4P 5d 5P 7m",
  "composite blues": "1P 2M 3m 3M 4P 5d 5P 6M 7m",
  "augmented": "1P 2A 3M 5P 5A 7M",
  "augmented heptatonic": "1P 2A 3M 4P 5P 5A 7M",
  "dorian #4": "1P 2M 3m 4A 5P 6M 7m",
  "lydian diminished": "1P 2M 3m 4A 5P 6M 7M",
  "whole tone": "1P 2M 3M 4A 5A 7m",
  "leading whole tone": "1P 2M 3M 4A 5A 7m 7M",
  "harmonic minor": "1P 2M 3m 4P 5P 6m 7M",
  "lydian minor": "1P 2M 3M 4A 5P 6m 7m",
  "neopolitan": "1P 2m 3m 4P 5P 6m 7M",
  "neopolitan minor": "1P 2m 3m 4P 5P 6m 7m",
  "neopolitan major": "1P 2m 3m 4P 5P 6M 7M",
  "neopolitan major pentatonic": "1P 3M 4P 5d 7m",
  "romanian minor": "1P 2M 3m 5d 5P 6M 7m",
  "double harmonic lydian": "1P 2m 3M 4A 5P 6m 7M",
  "diminished": "1P 2M 3m 4P 5d 6m 6M 7M",
  "harmonic major": "1P 2M 3M 4P 5P 6m 7M",
  "double harmonic major": "1P 2m 3M 4P 5P 6m 7M",
  "egyptian": "1P 2M 4P 5P 7m",
  "hungarian minor": "1P 2M 3m 4A 5P 6m 7M",
  "hungarian major": "1P 2A 3M 4A 5P 6M 7m",
  "oriental": "1P 2m 3M 4P 5d 6M 7m",
  "spanish": "1P 2m 3M 4P 5P 6m 7m",
  "spanish heptatonic": "1P 2m 3m 3M 4P 5P 6m 7m",
  "flamenco": "1P 2m 3m 3M 4A 5P 7m",
  "balinese": "1P 2m 3m 4P 5P 6m 7M",
  "todi raga": "1P 2m 3m 4A 5P 6m 7M",
  "malkos raga": "1P 3m 4P 6m 7m",
  "kafi raga": "1P 3m 3M 4P 5P 6M 7m 7M",
  "purvi raga": "1P 2m 3M 4P 4A 5P 6m 7M",
  "persian": "1P 2m 3M 4P 5d 6m 7M",
  "bebop": "1P 2M 3M 4P 5P 6M 7m 7M",
  "bebop dominant": "1P 2M 3M 4P 5P 6M 7m 7M",
  "bebop minor": "1P 2M 3m 3M 4P 5P 6M 7m",
  "bebop major": "1P 2M 3M 4P 5P 5A 6M 7M",
  "bebop locrian": "1P 2m 3m 4P 5d 5P 6m 7m",
  "minor bebop": "1P 2M 3m 4P 5P 6m 7m 7M",
  "mystery #1": "1P 2m 3M 5d 6m 7m",
  "enigmatic": "1P 2m 3M 5d 6m 7m 7M",
  "minor six diminished": "1P 2M 3m 4P 5P 6m 6M 7M",
  "ionian augmented": "1P 2M 3M 4P 5A 6M 7M",
  "lydian #9": "1P 2m 3M 4A 5P 6M 7M",
  "ichikosucho": "1P 2M 3M 4P 5d 5P 6M 7M",
  "six tone symmetric": "1P 2m 3M 4P 5A 6M"
}

},{}]},{},[1]);
