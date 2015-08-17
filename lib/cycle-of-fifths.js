var noteName = require('tonal/note/name')
var chord = require('tonal/chord/chord')
var fifths = require('tonal/cycles/fifths')

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
  var c = chord(name)
  var notes = c.map(noteName).join(' ')
  var label = 'Chord: ' + name + ' (' + notes + ')'
  var indexes = c.map(fifths)
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
