var vows = require('vows')
var assert = require('assert')
var tonal = require('../')

vows.describe('tonal').addBatch({
  'exists': function () {
    assert(tonal)
  },
  'pitch.notation': function () {
    assert.deepEqual(tonal.pitch.notation('C2'), [0, 0, 2])
  },
  'transpose': function () {
    assert.equal(tonal.transpose('E', '3M'), 'G#')
  },
  'scale': function () {
    assert.deepEqual(tonal.scale('1 2 3b 4 5 6 7b', 'C'),
      [ 'C', 'D', 'Eb', 'F', 'G', 'A', 'Bb' ])
  },
  'chord': function () {
    assert.deepEqual(tonal.scale('1 3 5 7b 9 11', 'C2'),
      [ 'C2', 'D2', 'E2', 'F2', 'G2', 'Bb2' ])
  }
}).export(module)
