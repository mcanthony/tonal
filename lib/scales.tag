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
    <a id="playBtn" onclick={ play } href="#">Play</a>
  </div>

  var ctx = new AudioContext()
  var Soundfont = require('soundfont-player')
  var soundfont = new Soundfont(ctx)
  var instrument = soundfont.instrument('acoustic_grand_piano')
  var Clock = require('./clock.js')
  var reverse = require('tonal/list/reverse')
  var scale = require('tonal/scale/scale')
  var octaves = require('tonal/list/octaves')
  this.tonics = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ')
  this.names = scale()
  this.names.sort()
  this.name = 'major'
  this.tonic = 'C'
  this.notes = notes(this.tonic, this.name)
  this.clock = null

  play(e) {
    if (!this.clock) {
      this.clock = new Clock(ctx)
      this.clock.tempo(120).limit(1)
      this.clock.tick(function (time, data, num) {
        instrument.play(data, time, 1)
      })
    }
    this.clock.data(this.notes)
    if (this.clock.running()) {
      this.playBtn.innerHTML = 'Play'
      this.clock.stop().reset()
    } else {
      this.playBtn.innerHTML = 'Stop'
      this.clock.start()
    }
  }

  function notes(tonic, name) {
    var s = octaves(scale(tonic + ' ' + name ), 1)
    return s.concat(reverse(s.slice(0, -1)))
    return s
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
