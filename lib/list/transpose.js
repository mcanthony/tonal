var transpose = require('../interval/transpose')
var add = require('../interval/add')
function transpose (interval, list) {
  list = toList(list)
  var tr = list[0] === 'P1' ? transpose : add
  return map(tr(interval))
}
