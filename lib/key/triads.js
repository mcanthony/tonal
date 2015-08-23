var toScale = require('../scale/scale')

function triads (scale, length) {
  length = length || 3
  scale = toScale(scale)
  var areIntervals = scale[0] === 'P1'
  return scale.map(function (s, num) {
    var mode = buildMode(scale, num, length)
    if (areIntervals)
      mode = transpose(opposite(mode[0]), mode)
    return mode
  })
}

function buildMode (scale, num, length) {
  var len = scale.length
  var triad = []
  for (var i = 0; i < length; i++) {
    triad.push(scale[(num + (i * 2)) % len])
  }
  return triad
}

module.exports = triads
