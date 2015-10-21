'use strict'

var tonal = {}

tonal.pitch = require('music-pitch')
tonal.pitch.notation = require('pitch-parser')
tonal.pitch.enharmonics = require('enharmonics')
tonal.transpose = require('pitch-transpose')

tonal.interval = require('music-interval')
tonal.interval.notation = require('interval-parser')

tonal.gamut = require('music-gamut')

tonal.scale = require('music-scale')
tonal.chord = require('music-chord')

if (typeof module === 'object' && module.exports) module.exports = tonal
if (typeof window !== 'undefined') window.tonal = tonal
