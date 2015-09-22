
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
