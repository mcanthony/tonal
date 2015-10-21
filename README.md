# tonal

[![Build Status](https://travis-ci.org/danigb/tonal.svg?branch=master)](https://travis-ci.org/danigb/tonal)
[![Code Climate](https://codeclimate.com/github/danigb/tonal/badges/gpa.svg)](https://codeclimate.com/github/danigb/tonal)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Tonal is a library to create and manipulate tonal elements of music (pitches, chords, scales and keys). It deals with abstractions (not actual music) and can be used to develop midi or audio software:

```js
var tonal = require('tonal/pitch')

// pitches
tonal.pitch.fromMidi(60) // => 'C4'
tonal.pitch.toMidi('A4') // => 69
tonal.pitch.fromFreq(220) // => 'A3'
tonal.pitch.toFreq('C') // => ...

// intervals and tranposition
tonal.tranpose('D4', '2M') // => 'E#4'

// scales
var minor = tonal.scale('1 2 3m 4 5 6 7')
minor('C') // => ['C', 'D', 'Eb', 'F', 'G', 'A', 'B']

// chords
var Maj7 = tonal.chord('1 3 5 7')
Maj7('C') // => ['C', 'E', 'G', 'B']

var V7 = tonal.chord('1 3 5 7m')
var V7ofV = function(pitch) { V7(tonal.transpose(pitch, '5P')) }
var V7ofV('D4') // => ['A4', 'C#5', 'E5', 'G7']
```

Tonal has a number of characteristics that make it unique:

- It is pure __functional__: no classes, no side effects, no mutations, just data-in-and-out and functions
- Heavy use of __strings to represent entities__: pitches (`'C#2'`, `'Bb'`, `'G##'`), intevals (`'2M'`, `'-9m'`), chords (`'Cmaj7'`, `'Bb79'`), scales (`'C major'`, `'Bb bebop'`), collections (`'C D E F'`, `'1P 2M 3M'`, `'Cmaj7 D9m'`), keys (`'C major'`, `'Bb minor'`, `'###'`)
- Extremely __modular__: in fact tonal is a facade of several node modules.
- Advanced features: binary scales, chord and scale detection, chord voicings, chord progressions

_This is still [beta software](https://github.com/danigb/tonal/blob/master/docs/TODO.md)_ and it's being actively developed. For a stable library see [teoria](https://github.com/saebekassebil/teoria)

## Modules

Tonal is a facade of several npm modules:

- [tonal.pitch](https://github.com/danigb/music-pitch)
- [tonal.interval](https://github.com/danigb/music-interval)
- [tonal.transpose](https://github.com/danigb/pitch-transpose)
- [tonal.scale](https://github.com/danigb/music-scale)
- [tonal.chord](https://github.com/danigb/music-chord)

## Usage

Install via npm: `npm i --save tonal` or use the distribution file ready for browsers.

## Documentation and tests

See each module

## Resources and inspiration

This library takes inspiration from lot of places:

- Teoria: https://github.com/saebekassebil/teoria
- Impro-Visor: https://www.cs.hmc.edu/~keller/jazz/improvisor/
- MusicKit: https://github.com/benzguo/MusicKit
- Music21: http://web.mit.edu/music21/doc/index.html

And many more... (see documentation)

## License

MIT License
