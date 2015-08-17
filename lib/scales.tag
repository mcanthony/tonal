<scales>
  <div>
    <h1>Scales demo { version }</h1>
    <select id="tonicSelect" onchange={ tonicChanged }>
      <option each={ tonic in tonics } value="{tonic}">{tonic}</option>
    </select>
    <select id="scaleType" onchange={ scaleChanged }>
      <option each={ name in names } value="{name}">{name}</option>
    </select>
    <h3>{tonic} {name}</h3>
    <h5>Notes: { notes.join(' ') }</h5>
    <vexflow notes="{ notes }"></vexflow>
  </div>

  var riot = require('riot')
  var scale = require('tonal/scale/scale')
  var names = require('tonal/scale/scale-names')
  this.tonics = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ')
  this.names = names()
  this.name = this.names[0]
  this.tonic = 'C'
  this.notes = scale(this.tonic + ' ' + this.name )

  scaleChanged(e) {
    this.name = scaleType.value
    this.notes = scale(this.tonic + ' ' + scaleType.value)
  }

  tonicChanged(e) {
    this.tonic = tonicSelect.value
    this.notes = scale(this.tonic + ' ' + scaleType.value)
  }
</scales>
