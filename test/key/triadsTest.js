var vows = require('vows')
var assert = require('assert')
var triads = require('../../lib/key/triads')
var name = require('../../lib/chord/name')

vows.describe('key/triads').addBatch({
  'simple use cases (see list/parse)': function () {
    assert.deepEqual(triads('C major', 4), [
      [ 'C4', 'E4', 'G4', 'B4' ],
      [ 'D4', 'F4', 'A4', 'C4' ],
      [ 'E4', 'G4', 'B4', 'D4' ],
      [ 'F4', 'A4', 'C4', 'E4' ],
      [ 'G4', 'B4', 'D4', 'F4' ],
      [ 'A4', 'C4', 'E4', 'G4' ],
      [ 'B4', 'D4', 'F4', 'A4' ]
    ])
    assert.deepEqual(triads('major', 4), [
      [ 'C4', 'E4', 'G4', 'B4' ],
      [ 'D4', 'F4', 'A4', 'C4' ],
      [ 'E4', 'G4', 'B4', 'D4' ],
      [ 'F4', 'A4', 'C4', 'E4' ],
      [ 'G4', 'B4', 'D4', 'F4' ],
      [ 'A4', 'C4', 'E4', 'G4' ],
      [ 'B4', 'D4', 'F4', 'A4' ]
    ])
    assert.deepEqual(triads('major', 4).map(name), [])
  }
}).export(module)
