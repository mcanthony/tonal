<scales>
  <div>
    <h1>Scales demo { version }</h1>
    <select id="tonicSelect" onchange={ tonicChanged }>
      <option each={ tonic in tonics } value="{tonic}">{tonic}</option>
    </select>
    <select id="scaleType" onchange={ scaleChanged }>
      <option each={ name in names } value="{name}"
        selected="{ name === 'major' }">{name}</option>
    </select>
    <h3>{tonic} {name}</h3>
    <h5>Notes: { notes.join(' ') }</h5>
    <vexflow notes="{ notes }"></vexflow>
  </div>

  var reverse = require('tonal/list/reverse')
  var scale = require('tonal/scale/scale')
  this.tonics = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ')
  this.names = scale()
  this.names.sort()
  this.name = 'major'
  this.tonic = 'C'
  this.notes = notes(this.tonic, this.name)

  function notes(tonic, name) {
    var s = scale(tonic + ' ' + name )
    return s
    // return s.concat(reverse(s))
  }

  scaleChanged(e) {
    this.name = scaleType.value
    this.notes = notes(this.tonic, this.name)
  }

  tonicChanged(e) {
    this.tonic = tonicSelect.value
    this.notes = notes(this.tonic, this.name)
  }
</scales>
