(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var note = require('tonal/note/note')
var chord = require('tonal/chord/chord')
var fifths = require('tonal/misc/fifths')

function fromNote (name) {
  return function (n) {
    n = note(n)
    return n ? n[name] : null
  }
}

addChord('CM')
addChord('Cm')
addChord('C+')
addChord('Cdim')
addChord('Cmaj7')
addChord('Cm7')
addChord('C7')
addChord('Cm7b5')
addChord('Cdim7')
addChord('CM7+')

function addChord (name) {
  var notes = chord(name)
  var names = notes.map(fromNote('pitchClass')).join(' ')
  var label = 'Chord: ' + name + ' (' + names + ')'
  var indexes = notes.map(fifths)
  addCycle(label, indexes)
}

function addCycle (label, indexes) {
  var canvas = document.createElement('canvas')
  var size = 120
  var diameter = size - 40

  var center = { x: size, y: size }
  canvas.width = center.x * 2
  canvas.height = center.y * 2
  var ctx = canvas.getContext('2d')
  ctx.lineWidth = 0.5

  // circle
  ctx.beginPath()
  ctx.strokeStyle = 'black'
  ctx.arc(center.x, center.y, diameter, 0, Math.PI * 2)
  ctx.stroke()
  ctx.closePath()

  var notes = 'Eb/D# Bb/A# F C G D A E B Gb/F# Db/C# Ab/G#'.split(' ')
  // mark the notes
  ctx.font = '10px sans-serif'
  for (var n = 0; n < 12; n++) {
    var angle = n * (Math.PI * 2 / 12)
    ctx.moveTo(circleX(angle, -5), circleY(angle, -5))
    ctx.lineTo(circleX(angle, 5), circleY(angle, 5))
    ctx.fillText(notes[n], circleX(angle, 12) - 4, circleY(angle, 12) + 4)
    ctx.stroke()
  }

  function circleX (angle, size) { return center.x + Math.cos(angle) * (diameter + size) }
  function circleY (angle, size) { return center.y + Math.sin(angle) * (diameter + size) }

  indexes = indexes.sort()
  console.log(indexes)
  for (var i = 0, len = indexes.length; i < len; i++) {
    drawLine(indexes[i], indexes[(i + 1) % len])
  }

  function drawLine (a, b) {
    ctx.strokeStyle = 'red'
    angle = (a + 3) % 12 * (Math.PI * 2 / 12)
    ctx.moveTo(circleX(angle, 0), circleY(angle, 0))
    angle = (b + 3) % 12 * (Math.PI * 2 / 12)
    ctx.lineTo(circleX(angle, 0), circleY(angle, 0))
    ctx.stroke()
  }

  var measure = ctx.measureText(label)
  ctx.fillText(label, size - (measure.width / 2), size * 2 - 12)

  document.getElementById('cycles').appendChild(canvas)
}

},{"tonal/chord/chord":2,"tonal/misc/fifths":17,"tonal/note/note":18}],2:[function(require,module,exports){
var data = require('./chords-all.json')
var dictionary = require('../list/dictionary')
var parse = require('./parse')

/**
 * Create a list from a chord name
 *
 * If the chord name contains the tonic, a note list is returned. If only the
 * chord type is given, you get an interval list.
 *
 * @param {String} name - a chord name (with or without tonic)
 * @return {Array} a list (of notes or intervals depending on the name)
 *
 * @name chord
 * @module chord
 * @see list/dictionary
 *
 * @example
 * chord('M') // => ['P1', 'M3', 'P5']
 * chord('C7') // => ['C4', 'E4', 'G4', 'B4']
 */
module.exports = dictionary(data, parse)

},{"../list/dictionary":11,"./chords-all.json":3,"./parse":4}],3:[function(require,module,exports){
module.exports={
  "2": "P1 M3 P5 M2",
  "4": "P1 P4 m7 m10",
  "5": "P1 P5",
  "6": "P1 M3 P5 M6",
  "7": "P1 M3 P5 m7",
  "9": "P1 M3 P5 m7 M9",
  "10": "P1 P5 M3",
  "11": "P1 P5 m7 M9 P11",
  "13": "P1 M3 P5 m7 M9 M13",
  "67": "P1 M3 P5 m7 M13",
  "69": "P1 M3 P5 M6 M2",
  "M": "P1 M3 P5",
  "M6": "P1 M3 P5 M6",
  "M69": "P1 M3 P5 M6 M2",
  "M6#11": "P1 M3 P5 M6 A4",
  "M69#11": "P1 M3 P5 M6 M2 A4",
  "Madd9": "P1 M3 P5 M2",
  "Msus2": "P1 M2 P5",
  "sus24": "P1 M2 P4 P5",
  "M7": "P1 M3 P5 M7",
  "M9": "P1 M3 P5 M7 M9",
  "M7#11": "P1 M3 P5 M7 A11",
  "M9#11": "P1 M3 P5 M7 M9 A11",
  "M13": "P1 M3 P5 M7 M9 M13",
  "M7add13": "P1 M3 P5 M6 M7 M9",
  "M13#11": "P1 M3 P5 M7 M9 A11 M13",
  "69#11": "P1 M3 P5 M6 M2 A4",
  "Mb5": "P1 M3 d5",
  "M7b5": "P1 M3 d5 M7",
  "M9b5": "P1 M3 d5 M7 M9",
  "M7#9#11": "P1 M3 P5 M7 A9 A11",
  "Msus4": "P1 P4 P5",
  "M7b6": "P1 M3 m6 M7",
  "9no5": "P1 M3 m7 M9",
  "M#5": "P1 M3 A5",
  "M7#5": "P1 M3 A5 M7",
  "M9#5": "P1 M3 A5 M7 M9",
  "M#5add9": "P1 M3 A5 M2",
  "M7sus4": "P1 P4 P5 M7",
  "M9sus4": "P1 P4 P5 M7 M9",
  "M7#5sus4": "P1 P4 A5 M7",
  "M9#5sus4": "P1 P4 A5 M7 M9",
  "+add#9": "P1 M3 A5 A2",
  "M7b9": "P1 M3 P5 M7 m9",
  "Mb6": "P1 M3 m6",
  "m": "P1 m3 P5",
  "m7": "P1 m3 P5 m7",
  "m6": "P1 m3 P4 P5 M6",
  "m69": "P1 m3 P5 M6 M2",
  "madd9": "P1 m3 P5 M2",
  "madd4": "P1 m3 P4 P5",
  "mM7": "P1 m3 P5 M7",
  "mM9": "P1 m3 P5 M7 M9",
  "mM7b6": "P1 m3 P5 m6 M7",
  "mM9b6": "P1 m3 P5 m6 M7 M9",
  "m9": "P1 m3 P5 m7 M9",
  "m11": "P1 m3 P5 m7 M9 P11",
  "m7add11": "P1 m3 P5 m7 P11",
  "m13": "P1 m3 P5 m7 M9 P11 M13",
  "m7b5": "P1 m3 d5 m7",
  "m9b5": "P1 m3 m7 d12 M9",
  "m11b5": "P1 m3 m7 d12 M9 P11",
  "m#5": "P1 m3 A5",
  "mb6b9": "P1 m3 m6 m2",
  "mb6M7": "P1 m3 m6 M7",
  "m7#5": "P1 m3 m6 m7",
  "m9#5": "P1 m3 m6 m7 M9",
  "m11#5": "P1 m3 m6 m7 M9 P11",
  "addb9": "P1 M3 P5 m2",
  "7no5": "P1 M3 m7",
  "7b9": "P1 M3 P5 m7 m9",
  "7b9#9": "P1 M3 P5 m7 m9 A9",
  "7#5": "P1 M3 A5 m7",
  "7#9": "P1 M3 P5 m7 A9",
  "7#11": "P1 M3 P5 m7 A11",
  "7#9#11": "P1 M3 P5 m7 A9 A11",
  "7#9b13": "P1 M3 P5 m7 A9 m13",
  "7#9#11b13": "P1 M3 P5 m7 A9 A11 m13",
  "7b5": "P1 M3 d5 m7",
  "9#11": "P1 M3 P5 m7 M9 A11",
  "9b5": "P1 M3 d5 m7 M9",
  "9#5": "P1 M3 A5 m7 M9",
  "9#5#11": "P1 M3 A5 m7 M9 A11",
  "11b9": "P1 P5 m7 m9 P11",
  "7add6": "P1 M3 P5 m7 M13",
  "13no5": "P1 M3 m7 M9 M13",
  "7b13": "P1 M3 m7 m13",
  "7b6": "P1 M3 P5 m6 m7",
  "9b13": "P1 M3 m7 M9 m13",
  "7#11b13": "P1 M3 P5 m7 A11 m13",
  "9#11b13": "P1 M3 P5 m7 M9 A11 m13",
  "13b9": "P1 M3 P5 m7 m9 M13",
  "13b5": "P1 M3 d5 M6 m7 M9",
  "13#9": "P1 M3 P5 m7 A9 M13",
  "13#11": "P1 M3 P5 m7 M9 A11 M13",
  "13#9#11": "P1 M3 P5 m7 A9 A11 M13",
  "7sus4": "P1 P4 P5 m7",
  "9sus4": "P1 P4 P5 m7 M9",
  "7#5sus4": "P1 P4 A5 m7",
  "7sus4b9": "P1 P4 P5 m7 m9",
  "7sus4b9b13": "P1 P4 P5 m7 m9 m13",
  "13sus4": "P1 P4 P5 m7 M9 M13",
  "7b9#11": "P1 M3 P5 m7 m9 A11",
  "13b9#11": "P1 M3 P5 m7 m9 A11 M13",
  "7b9b13": "P1 M3 P5 m7 m9 m13",
  "7b9b13#11": "P1 M3 P5 m7 m9 A11 m13",
  "7#5b9": "P1 M3 A5 m7 m9",
  "7#5b9#11": "P1 M3 A5 m7 m9 A11",
  "7#5#9": "P1 M3 A5 m7 A9",
  "o": "P1 m3 d5",
  "o7": "P1 m3 d5 M6",
  "oM7": "P1 m3 d5 M7",
  "o7M7": "P1 m3 d5 M6 M7",
  "Blues": "P1 m3 P4 d5 P5 m7",
  "m10": "P1 P5 m3",
  "Major": "P1 M3 P5",
  "minor": "P1 m3 P5",
  "minor7": "P1 m3 P5 m7",
  "Dominant": "P1 M3 P5 m7",
  "augmented": "P1 M3 A5",
  "diminished": "P1 m3 d5 M6",
  "half-diminished": "P1 m3 d5 m7",
  "quartal": "P1 P4 m7 m10",
  "": "P1 M3 P5",
  "M6b5": "P1 M3 P5 M6 A4",
  "6#11": "P1 M3 P5 M6 A4",
  "6b5": "P1 M3 P5 M6 A4",
  "add9": "P1 M3 P5 M2",
  "add9no3": "P1 M2 P5",
  "sus": "P1 P4 P5",
  "sus2": "P1 M2 P5",
  "add2": "P1 M3 P5 M2",
  "sus4add9": "P1 M2 P4 P5",
  "maj7": "P1 M3 P5 M7",
  "Maj7": "P1 M3 P5 M7",
  "maj9": "P1 M3 P5 M7 M9",
  "Maj9": "P1 M3 P5 M7 M9",
  "maj7#11": "P1 M3 P5 M7 A11",
  "Maj7#11": "P1 M3 P5 M7 A11",
  "maj9#11": "P1 M3 P5 M7 M9 A11",
  "Maj9#11": "P1 M3 P5 M7 M9 A11",
  "maj13": "P1 M3 P5 M7 M9 M13",
  "Maj13": "P1 M3 P5 M7 M9 M13",
  "maj13#11": "P1 M3 P5 M7 M9 A11 M13",
  "Maj13#11": "P1 M3 P5 M7 M9 A11 M13",
  "sus4": "P1 P4 P5",
  "susb9": "P1 P4 P5 m7 m9",
  "7susb9": "P1 P4 P5 m7 m9",
  "7b9sus": "P1 P4 P5 m7 m9",
  "7b9sus4": "P1 P4 P5 m7 m9",
  "phryg": "P1 P4 P5 m7 m9",
  "maj#5": "P1 M3 A5",
  "Maj#5": "P1 M3 A5",
  "maj7#5": "P1 M3 A5 M7",
  "Maj7#5": "P1 M3 A5 M7",
  "maj9#5": "P1 M3 A5 M7",
  "Maj9#5": "P1 M3 A5 M7 M9",
  "+": "P1 M3 A5",
  "aug": "P1 M3 A5",
  "M7+": "P1 M3 A5 M7",
  "+add9": "P1 M3 A5 M2",
  "mMaj7": "P1 m3 P5 M7",
  "mMaj9": "P1 m3 P5 M7 M9",
  "mMaj7b6": "P1 m3 P5 m6 M7",
  "mMaj9b6": "P1 m3 P5 m6 M7 M9",
  "m7add4": "P1 m3 P5 m7 P11",
  "h7": "P1 m3 d5 m7",
  "mb5": "P1 m3 d5",
  "m6b5": "P1 m3 d5 M6",
  "h9": "P1 m3 m7 d12 M9",
  "h11": "P1 m3 m7 d12 M9 P11",
  "m+": "P1 m3 A5",
  "mb6": "P1 m3 A5",
  "+7": "P1 M3 A5 m7",
  "7+": "P1 M3 A5 m7",
  "7aug": "P1 M3 A5 m7",
  "aug7": "P1 M3 A5 m7",
  "7b5#9": "P1 M3 P5 m7 A9 A11",
  "9+": "P1 M3 A5 m7 M9",
  "7add13": "P1 M3 P5 m7 M13",
  "9b5b13": "P1 M3 P5 m7 M9 A11 m13",
  "7sus": "P1 P4 P5 m7",
  "9sus": "P1 P4 P5 m7 M9",
  "7b9b13sus4": "P1 P4 P5 m7 m9 m13",
  "13sus": "P1 P4 P5 m7 M9 M13",
  "7b9#11b13": "P1 M3 P5 m7 m9 A11 m13",
  "7b5b9": "P1 M3 P5 m7 m9 A11",
  "7b5b13": "P1 M3 P5 m7 A11 m13",
  "7b5b9b13": "P1 M3 P5 m7 m9 A11 m13",
  "7alt": "P1 M3 A5 m7 A9",
  "dim": "P1 m3 d5",
  "dim7": "P1 m3 d5 M6",
  "-": "P1 m3 P5 m7",
  "-7": "P1 m3 P5 m7",
  "-9": "P1 m3 P5 m7 M9",
  "-11": "P1 m3 P5 m7 M9 P11",
  "-13": "P1 m3 P5 m7 M9 P11 M13",
  "-7b5": "P1 m3 d5 m7",
  "-9b5": "P1 m3 m7 d12 M9",
  "-11b5": "P1 m3 m7 d12 M9 P11",
  "-6": "P1 m3 P4 P5 M6",
  "-69": "P1 m3 P5 M6 M2",
  "-M7": "P1 m3 P5 M7",
  "-M9": "P1 m3 P5 M7 M9",
  "7+4": "P1 M3 P5 m7 A11",
  "7#4": "P1 M3 P5 m7 A11",
  "9+4": "P1 M3 P5 m7 M9 A11",
  "9#4": "P1 M3 P5 m7 M9 A11",
  "13+4": "P1 M3 P5 m7 M9 A11 M13",
  "13#4": "P1 M3 P5 m7 M9 A11 M13",
  "M7+4": "P1 M3 P5 M7 A11",
  "M7#4": "P1 M3 P5 M7 A11",
  "M9+4": "P1 M3 P5 M7 M9 A11",
  "M9#4": "P1 M3 P5 M7 M9 A11",
  "M13+4": "P1 M3 P5 M7 M9 A11 M13",
  "M13#4": "P1 M3 P5 M7 M9 A11 M13",
  "7_": "P1 M3 P5 m7",
  "9_": "P1 M3 P5 m7 M9",
  "13_": "P1 M3 P5 m7 M9 M13",
  "7#11_": "P1 M3 P5 m7 A11",
  "9#11_": "P1 M3 P5 m7 M9 A11",
  "13#11_": "P1 M3 P5 m7 M9 A11 M13",
  "7#4_": "P1 M3 P5 m7 A11",
  "9#4_": "P1 M3 P5 m7 M9 A11",
  "13#4_": "P1 M3 P5 m7 M9 A11 M13",
  "13#9_": "P1 M3 P5 m7 A9 M13",
  "7#9_": "P1 M3 P5 m7 A9",
  "7#5#9_": "P1 M3 A5 m7 A9",
  "7#9b13_": "P1 M3 A5 m7 A9"
}
},{}],4:[function(require,module,exports){
var REGEX = /^\s*([a-gA-G])(#{1,4}|b{1,4}|x{1,2}|)(.*)$/
/**
 * Parse a chord name and returns the tonic (if any) and the chord type
 *
 * The returned object has the properties:
 * - tonic: the tonic note or null if not specified
 * - type: the chord type
 *
 * @param {String} chord - the chord string to be parsed
 * @return {Object} the chord object
 *
 * @example
 * parse('C#major') // => { tonic: 'C#', type: 'major' }
 * parse('minor') // => { tonic: null, type: 'minor' }
 */
function parse (chord) {
  var m = REGEX.exec(chord)
  if (m) return { tonic: m[1] + m[2], type: m[3].trim() }
  else return { tonic: null, type: chord.trim() }
}

module.exports = parse

},{}],5:[function(require,module,exports){
var strict = require('../utils/strict')
var parse = strict('Note not valid', require('../note/parse'))
var interval = require('./interval')

var STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
/**
 * Get the interval between two notes
 *
 * This is the function to calculate distances (expressed in intervals) for
 * two notes. An alias of this function is in `note/distance`
 *
 * This is an 'strict' function: if the notes are note valid, an
 * exception is thrown.
 *
 * You can get a _curryfied_ version of this function by passing only one
 * parameter. See examples below:
 *
 * @param {String} from - first note
 * @param {String} to - second note
 * @return {String} the interval between notes
 *
 * @example
 * fromNotes('C', 'D') // => 'M2'
 * ['C', 'D', 'Eb'].map(fromNotes('C')) // => ['P1', 'M2', 'm3']
 */
function fromNotes (from, to) {
  if (arguments.length === 1) {
    return function (to) {
      return fromNotes(from, to)
    }
  }

  from = parse(from)
  to = parse(to)
  var num = STEPS.indexOf(to.letter) - STEPS.indexOf(from.letter)
  num = num < 0 ? num + 8 : num + 1
  var alter = to.alter - from.alter
  var oct = to.oct - from.oct
  return interval(num, alter, oct).name
}

module.exports = fromNotes

},{"../note/parse":19,"../utils/strict":23,"./interval":6}],6:[function(require,module,exports){
var parse = require('./parse')

var QUALITIES = {
  P: {'-2': 'dd', '-1': 'd', 0: 'P', 1: 'A', 2: 'AA'},
  M: {'-3': 'dd', '-2': 'd', '-1': 'm', 0: 'M', 1: 'A', 2: 'AA'}
}

/**
 * Create a interval from its components
 *
 * @param {Integer} num - the interval number
 * @param {Integer} alter - the interval alteration (0 is perfect or major)
 * @param {Integer} oct - (Optional) the octaves, 0 by default
 * @param {boolean} descending - (Optional) create a descending interval (false
 * by default)
 *
 * @example
 * interval(1) // => 'P1'
 * interval(1, 1) // => 'A1'
 * interval(1, 1, 2) // => 'A8'
 * interval(1, 1, 2, -1) // => 'A-8'
 * interval(2, -1, 2, -1) // => 'm-9'
 */
function interval (num, alter, oct, dir) {
  if (isNaN(num)) {
    var i = parse(num)
    alter = isNaN(alter) ? i.alter : alter
    oct = isNaN(oct) ? i.oct : oct
    dir = isNaN(dir) ? i.dir : dir
    q = QUALITIES[i.type][alter] || i.quality
    return q ? parse(q + dir * (i.num + 7 * oct)) : null
  } else {
    if (num === 0) throw Error('0 is not a valid interval number.')
    var simple = num > 8 ? (num % 7 || 7) : num
    var type = (simple === 1 || simple === 4 || simple === 5 || simple === 8) ? 'P' : 'M'
    alter = alter || 0
    oct = oct || 0
    dir = dir ? -1 : 1
    var q = QUALITIES[type][alter]
    return q ? parse(q + dir * (num + 7 * oct)) : null
  }
}

module.exports = interval

},{"./parse":9}],7:[function(require,module,exports){
'use strict'
var parse = require('./parse')

/**
 * Invert an interval
 *
 * Get the [inversion](https://en.wikipedia.org/wiki/Interval_(music)#Inversion)
 * of an interval.
 *
 * @param {String} interval - the interval to invert
 * @param {Boolean} ascending - (Optional) if true, the inverted interval will
 * be ascending, if false (by default) the direction will be the same as the
 * given interval
 *
 * @example
 * simple('M9') // => 'M2'
 * simple('M-10') // => 'M-3'
 * simple('P-11', true) // => 'P4'
 */
function invert (interval, ascending) {
  interval = parse(interval)
  var quality = INVERT[interval.quality]
  var simple = interval.simple
  var dir = ascending === true ? 1 : interval.dir
  var num = 9 - simple
  return quality + (dir * num)
}

module.exports = invert

var INVERT = {'d': 'A', 'm': 'M', 'P': 'P', 'M': 'm', 'A': 'd'}

},{"./parse":9}],8:[function(require,module,exports){
var parse = require('./parse')
/**
 * Test if a string is a valid interval
 *
 * @param {String} interval - the interval to be tested
 * @return {Boolean} true if its a valid interval
 *
 * @example
 * isInterval('blah') // false
 * isInterval('P5') // true
 * isInterval('P6') // false
 */
function isInterval (interval) {
  return parse(interval) !== null
}

module.exports = isInterval

},{"./parse":9}],9:[function(require,module,exports){
'use strict'

var REGEX = /^(dd|d|m|M|P|A|AA)(-?)(\d+)$/
// size in semitones to generic semitones in non altered state
// last 0 is beacuse P8 is oct = 1
var SEMITONES = [null, 0, 2, 4, 5, 7, 9, 11, 0]
// alteration values
var ALTERS = {
  P: { dd: -2, d: -1, P: 0, A: 1, AA: 2 },
  M: { dd: -3, d: -2, m: -1, M: 0, A: 1, AA: 2 }
}

/**
 * Parse an interval and get its properties
 *
 * Probably you will want to use `interval/interval` instead.
 *
 * This method retuns an object with the following properties:
 * - name: the parsed interval
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
 * @param {String} name - the name of the interval to be parsed
 * @return {Array} a interval object or null if not a valid interval
 *
 * @name parse
 * @module interval
 * @see interval/interval
 *
 * @example
 * var parse = require('tonal/interval/parse')
 * parse('P-5') // => {quality: 'P', dir: -1, num: 5, generic: 4, alter: 0, perfectable: true }
 * parse('m9') // => {quality: 'm', dir: 1, num: 9, generic: 1, alter: -1, perfectable: false }
 */
function parse (interval) {
  var m = REGEX.exec(interval)
  if (!m) return null // not valid interval

  var num = +m[3]
  if (num === 0) return null

  var q = m[1]
  var dir = m[2] === '' ? 1 : -1
  var simple = num > 8 ? (num % 7 || 7) : num
  var type = (simple === 1 || simple === 4 || simple === 5 || simple === 8) ? 'P' : 'M'
  if (q === 'M' && type === 'P' || q === 'P' && type !== 'P') return null
  var alt = ALTERS[type][q]
  if (alt == null) return null
  var oct = Math.floor((num - 1) / 7)
  var semitones = dir * ((SEMITONES[simple] + alt) + 12 * oct)

  return { name: m[0], quality: q, dir: dir, num: num, simple: simple,
    perfectable: type === 'P', oct: oct, alter: alt,
    semitones: semitones, type: type }
}

var memoize = require('../utils/fastMemoize')
var coerce = require('../utils/coerceParam')
module.exports = coerce('name', memoize(parse))

},{"../utils/coerceParam":21,"../utils/fastMemoize":22}],10:[function(require,module,exports){
var strict = require('../utils/strict')
var parseNote = strict('Note not valid', require('../note/parse'))
var toNote = require('../note/note')
var step = require('../note/step')
var parseInterval = strict('Interval not valid', require('./parse'))
var isInterval = require('./isInterval')
var invert = require('./invert')

var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Transpose a note by an interval
 *
 * This is the principal function of interval module. You should be able to
 * transpose any note with any interval. (if not, is a bug ;-)
 *
 * You can also get a currified version by passing one parameter instead
 * of two. For example, with `transpose('M2')` you get a function that transposes
 * any note by a 'M2' interval. The same way, with `transpose('C4')` you get
 * a function that transposes C4 to the given interval. See examples below.
 *
 * This is an _strict_ function: if note or interval are not valid, an exception
 * is thrown
 *
 * @param {String} interval - the interval to tranpose
 * @param {String} note - the note to be transposed
 * @return {String} the resulting note
 *
 * @example
 * transpose('M2', 'E') // => 'F#4'
 * transpose('M-2', 'C') // => 'Bb3'
 * ['C', 'D', 'E'].map(transpose('M2')) // => ['D4', 'E4', 'F#4']
 * ['M2', 'm3', 'P-8'].map(tranapose('C')) // => ['D4', 'Eb4', 'C3']
 */
function transpose (interval, note) {
  // return a currified function if arguments == 0
  if (arguments.length === 1) {
    var param = arguments[0]
    return function (other) {
      if (isInterval(param)) return transpose(param, other)
      else return transpose(other, param)
    }
  }

  // parse interval and notes in strict mode
  interval = parseInterval(interval)
  note = parseNote(note)

  // if its an octave, do a short path
  if (interval === 'P1') {
    return note.pitchClass + note.oct
  } else if (interval.quality === 'P' && interval.simple === 8) {
    return note.pitchClass + (note.oct + interval.dir * interval.oct)
  }

  // if its descending, apply the inverse lowering an octave
  var interSize
  if (interval.dir === -1) {
    interval = parseInterval(invert(interval, true))
    interSize = interval.semitones - 12 * (interval.oct + 1)
  } else {
    interSize = interval.semitones - 12 * interval.oct
  }

  // we got the correct step note (without accidentals)
  var destStep = step(note, (interval.simple - 1) % 7)
  // calc the distance to that step note
  var destSize = (SEMITONES[destStep] - note.chroma)
  // the difference is the alteration of the note
  var difference = interSize - destSize
  // if the difference is more than an octave, reduce alterations
  var oct = note.oct + interval.oct
  if (difference > 11) {
    difference -= 12
    oct++
  } else if (difference < -11) {
    difference += 12
    oct--
  }
  // return the note
  return toNote(destStep, difference, oct).name
}

module.exports = transpose

},{"../note/note":18,"../note/parse":19,"../note/step":20,"../utils/strict":23,"./invert":7,"./isInterval":8,"./parse":9}],11:[function(require,module,exports){
var notes = require('../list/notes')
var intervals = require('../list/intervals')

/**
 * Create a list dictionary from a hash map data and a name parser
 *
 * A list dictionary is a function that generates lists from keys. It uses
 * a parser to remove the tonic (if present) from the key. Then look up
 * into the hash for a name and pass it to a list generator.
 *
 * If the returned dictionary is called without arguments, a list of all keys
 * is returned
 *
 * If the name is not found in the hash data, it throws an exception
 *
 * The parser should receive one string and return an object with two string
 * properties:
 * - tonic: a note if any, or null
 * - type: (required) the key to lookfor
 *
 * The scale/scale and chord/chord functions uses this to create a generator.
 *
 * @param {Hash} data - the data hash (dictionary)
 * @param {Function} parser - a function that parses the name and returns
 * an object with tonic (if not present) and the name properties
 * @return {Function} the list dictionary
 *
 * @example
 * var listDict = require('tonal/data/listDict')
 * var scale = listDict({'major': 2773})
 * scale('C major') // => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
 * scale('major') // => ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']
 * // get keys:
 * scale() // => ['major']
 */
function listDict (data, parser) {
  parser = parser || parseName
  var keys = null
  return function (name) {
    // if no aguments, returns keys
    if (arguments.length === 0) {
      keys = keys || Object.keys(data).sort()
      return keys
    }

    // if its already a list, return it
    if (Array.isArray(name)) return name

    // parse the name
    var parsed = parser(name)
    var listIdentifier = data[parsed.type]
    if (!listIdentifier) throw Error('Name not found: ' + parsed.type)
    return parsed.tonic ? notes(listIdentifier, parsed.tonic) : intervals(listIdentifier)
  }
}

module.exports = listDict

var REGEX = /^([a-gA-G])?\s*(.*)$/
function parseName (name) {
  var m = REGEX.exec(name)
  return m ? { tonic: m[1], type: m[2] } : m
}

},{"../list/intervals":12,"../list/notes":15}],12:[function(require,module,exports){
var distance = require('../interval/fromNotes')
var toList = require('./list')

function intervals (list) {
  list = toList(list)
  if (!list) return null
  if (list[0] === 'P1' || list[0] === 'P-1') return list
  return list.map(distance(list[0]))
}

module.exports = intervals

},{"../interval/fromNotes":5,"./list":14}],13:[function(require,module,exports){
'use strict'

var BINARY = /^1[01]{11}$/

/**
 * Determine if a given number is a valid binary list number
 *
 * A valid binary list is a binary number with two conditions:
 * - its 12 digit long
 * - starts with 1 (P1 interval)
 *
 * The binary number can be expressed in decimal as well (i.e 2773)
 *
 * @param {String} number - the number to test
 * @return {boolean} true if its a valid scale binary number
 *
 * @example
 * isBinary('101010101010') // => true
 * isBinary(2773) // => true
 * isBinary('001010101010') // => false (missing first 1)
 * isBinary('1001') // => false
 */
function isBinaryList (number) {
  return BINARY.test(number.toString(2))
}

module.exports = isBinaryList

},{}],14:[function(require,module,exports){
var parse = require('./parse')
/**
 * Get a list of notes or isInterval
 *
 * This is the principal function to create lists. Basically does the same as
 * `list/parse` but if an array is given, it returns it without modification
 * or validation (so, only pass an array when you are sure that is a valid list)
 *
 * @param {String|Array} list - the list to be parsed or passed
 * @return {Array} an array list of notes or intervals (or anything it you pass
 * an array to the function)
 *
 * @example
 * list('c d# e5') // => ['C4', 'D#4', 'E5']
 * list('P1 m2') // => ['P1', 'm2']
 * list('bb2') // => ['Bb2']
 * list('101') // => ['P1', 'M2']
 * // to validate an array
 * list(['C#3', 'P2'].join(' ')) // => null
 */
function list (l) {
  if (Array.isArray(l)) return l
  else return parse(l)
}

module.exports = list

},{"./parse":16}],15:[function(require,module,exports){
var transpose = require('../interval/transpose')
var intervals = require('./intervals')
var toList = require('./list')

function notes (list, tonic) {
  list = toList(list)
  if (!list) return null

  if (list[0] === 'P1' || list[0] === 'P-1') {
    return list.map(transpose(tonic))
  } else {
    if (!tonic) return list
    return intervals(list).map(transpose(tonic))
  }
}

module.exports = notes

},{"../interval/transpose":10,"./intervals":12,"./list":14}],16:[function(require,module,exports){
var isBinary = require('./isBinary')
var toNote = require('../note/note')
var isInterval = require('../interval/isInterval')

/**
 * Parse a string to a note or interval list
 *
 * The string can be notes or intervals separated by white spaces or a binary
 * or decimal representation of a interval list
 *
 * @param {String|Integer} list - the string to be parsed
 * @return {Array} an array of notes or intervals, null if not valid list
 */
function parse (list) {
  if (isBinary(list)) return binaryIntervals(list.toString(2))
  else if (typeof list === 'string') list = list.split(' ')
  else return null

  var notes = toNotes(list)
  return notes ? notes : toIntervals(list)
}

module.exports = parse

var CHROMA = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7']
function binaryIntervals (binary) {
  var result = []
  for (var i = 0, len = binary.length; i < len; i++) {
    if (binary[i] === '1') result.push(CHROMA[i])
  }
  return result
}

function toNotes (list) {
  var note
  for (var i = 0, len = list.length; i < len; i++) {
    note = toNote(list[i])
    if (note === null) return null
    else list[i] = note.name
  }
  return list
}

function toIntervals (list) {
  if (list[0] !== 'P1' && list[0] !== 'P-1') return null
  for (var i = 1, len = list.length; i < len; i++) {
    if (!isInterval(list[i])) return null
  }
  return list
}

},{"../interval/isInterval":8,"../note/note":18,"./isBinary":13}],17:[function(require,module,exports){
var toName = require('../note/note')

var ASC = 'C G D A E B F# C# G# D# A# E#'.split(' ')
var DESC = 'C F Bb Eb Ab Db Gb Cb Fb Bbb Ebb Abb'.split(' ')
/**
 * Get the relation between a note and the number of steps in the
 * cycle of fifths (with root in C)
 *
 * @param {Integer|String} step - if it's an integer, returns the note step after
 * moving `step` steps in the cycle. If it's a step string, returns the number
 * of steps starting from 'C' to the given step
 * @return {String|Integer} - the note name or the number of steps (depending of the param)
 *
 * @example
 * var cycle = require('tonal/cycle-of-fifths')
 * cycle(0) // => 'C'
 * cycle(1) // => 'G'
 * cycle(-1) // => 'F'
 * cycle('C') // => 0
 * cycle('G') // => 1
 * cycle('F') // => -1
 * cycle('C2') // => undefined
 */
function fifths (step) {
  if (/^\d+$/.test(step)) {
    return ASC[+step % 12]
  } else if (/^-\d+$/.test(step)) {
    return DESC[Math.abs(+step) % 12]
  } else if (typeof step === 'string') {
    step = toName(step).pitchClass
    var index = ASC.indexOf(step)
    if (index > 0) {
      return index
    } else {
      index = DESC.indexOf(step)
      return index < 0 ? undefined : -1 * index
    }
  }
}

module.exports = fifths

},{"../note/note":18}],18:[function(require,module,exports){
var parse = require('./parse')

var ACCIDENTALS = { '-4': 'bbbb', '-3': 'bbb', '-2': 'bb', '-1': 'b',
  0: '', 1: '#', 2: '##', 3: '###', 4: '####'}

/**
 * Create a note from its components (letter, octave, alteration)
 *
 * It returns the cannonical representation of a note (ie. 'C##2', 'Db3')
 * In tonal it means a string with:
 * - letter (in upper case)
 * - accidentals (with '#' or 'b', never 'x')
 * - a octave number (a positive decimal, always present)
 *
 * @param {String} note or step - a string with a note or a note letter
 * @param {Integer} alteration - (Optional) the alteration number. If not set
 * uses the alterations from the note (if present) or 0
 * @param {Integer} octave - (Optional) the note octave. If note set uses the
 * octave from the note (if present) or 4
 * @return {Object} an object with the note properties (@see note/parse)
 *
 * @module note
 *
 * @example
 * note('D', -2, 3) // => 'Dbb3'
 * note('G', 2, 1) // => 'G##1'
 * note('C', 1) // => 'C#4'
 * note('C##', -1) // => 'Cb4'
 * note('Cx') // => 'C##4'
 * note('Cx', null, 2) // => 'C##2'
 */
function note (note, acc, oct) {
  note = parse(note)
  if (!note) return null

  acc = acc ? ACCIDENTALS[acc] : note.acc
  if (acc === null) return null
  oct = oct ? oct : note.oct
  return parse(note.letter + acc + oct)
}

module.exports = note

},{"./parse":19}],19:[function(require,module,exports){
var REGEX = /^([a-gA-G])(#{1,4}|b{1,4}|x{1,2}|)(\d*)$/
var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Parse a note and return its properties
 *
 * Probably you want to use `note/note` instead.
 *
 * It returns an object with the following properties:
 *
 * - __name__: {String} the parsed note string
 * - __letter__: the note letter __always__ in uppercase
 * - __pitchClass__: the note [pitch class](https://en.wikipedia.org/wiki/Pitch_class)
 * (letter in uppercase, accidentals using 'b' or '#', never 'x', no octave)
 * - __acc__: a string with the accidentals or '' if no accidentals (never null)
 * - __oct__: a integer with the octave. If not present in the note, is set to 4
 * - __alter__: the integer representic the accidentals (0 for no accidentals,
 * - __midi__: {Integer} the midi value
 * -1 for 'b', -2 for 'bb', 1 for '#', 2 for '##', etc...)
 * - __chroma__: {Integer} the pitch class interger value (between 0 and 11)
 * where C=0, C#=1, D=2...B=11
 *
 * @param {String} note - the note (pitch) to be p
 * @return an object with the note components or null if its not a valid note
 *
 * @see note/note
 *
 * @example
 * parse('C#2') // => { }
 */
function parse (note) {
  var m = REGEX.exec(note)
  if (!m) return null

  var n = { name: m[0] }
  n.letter = m[1].toUpperCase()
  n.acc = m[2].replace(/x/g, '##')
  n.pitchClass = n.letter + n.acc
  n.oct = m[3] === '' ? 4 : +m[3]
  n.alter = n.acc[0] === 'b' ? -n.acc.length : n.acc.length
  n.chroma = SEMITONES[n.letter] + n.alter
  n.midi = n.chroma + 12 * (n.oct + 1)
  return n
}

var memoize = require('../utils/fastMemoize')
var coerce = require('../utils/coerceParam')
module.exports = coerce('name', memoize(parse))

},{"../utils/coerceParam":21,"../utils/fastMemoize":22}],20:[function(require,module,exports){
var parse = require('./parse')

var STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
/**
 * Transpose note steps
 *
 * @param {String} note - the note to get the step from
 * @param {Integer} steps - (Optional) the number of steps to move (ascending if
 * positive or descending oterwise). 0 by default
 * @return {String} the step (in uppercase)
 *
 * @example
 * step('C', 1) // => 'D'
 * step('C#', 1) // => 'D'
 * step('C#2', -1) // => 'B'
 * step('C#') // => 'C'
 */
function step (note, steps) {
  note = parse(note)
  if (!note) return null
  else if (!steps) return note.letter
  if (steps < 0) steps = 7 + (steps % 7)
  return STEPS[(STEPS.indexOf(note.letter) + steps) % 7]
}

module.exports = step

},{"./parse":19}],21:[function(require,module,exports){
/**
 * Internal function: ensures the param is a string
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
    else throw Error('The ' + name + ' must be a string: ' + param)
  }
}

module.exports = coerce

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
/**
 * Decorate a function to throw exception when return null
 *
 * @example
 * var parse = require('tonal/note/parse')
 * var strictParse = strict('Not a valid note', parse)
 * strictParse('P8') // throws Error with msg 'Not a valid note'
 */
function strict (msg, func) {
  return function () {
    var r = func.apply(this, arguments)
    if (r === null) throw Error(msg + ': ' + arguments[0])
    return r
  }
}

module.exports = strict

},{}]},{},[1]);
