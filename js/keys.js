(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*
 Precise scheduling for audio events is
 based on the method described in this article by Chris Wilson:
   http://www.html5rocks.com/en/tutorials/audio/scheduling/
*/

module.exports = function (ctx) {

  var lookahead = 25.0 // ms
  var scheduleAheadTime = 0.1 // s

  var tempo // ticks per minute

  var tickInterval // seconds per tick

  var data = []

  var currentTick = 0
  var nextTickTime = 0

  var tick = function (t, d, i) {}
  var each = function (t, i) {}

  var iterations = 0
  var limit = 0

  var timer
  var running = false

  function loop () {}

  function nextTick () {
    nextTickTime += tickInterval

    // cycle through ticks
    if (++currentTick >= data.length) {
      currentTick = 0
      iterations += 1
    }

  }

  function scheduleTick (tickNum, time) {
    tick.call(loop, time, data[tickNum], tickNum)
  }

  function scheduleIteration (iterationNum, time) {
    each.call(loop, time, iterationNum)
  }

  function scheduler () {
    while (nextTickTime < ctx.currentTime + scheduleAheadTime) {
      scheduleTick(currentTick, nextTickTime)
      if (currentTick === 0) {
        scheduleIteration(iterations, nextTickTime)
      }
      nextTick()
      if (limit && iterations >= limit) {
        loop.reset()
        return
      }
    }
    timer = window.setTimeout(scheduler, lookahead)
  }

  loop.tempo = function (bpm) {
    if (!arguments.length) return tempo
    tempo = bpm
    tickInterval = 60 / tempo
    return loop
  }
  loop.tickInterval = function (s) {
    if (!arguments.length) return tickInterval
    tickInterval = s
    tempo = 60 / tickInterval
    return loop
  }
  loop.data = function (a) {
    if (!arguments.length) return data
    data = a
    return loop
  }
  loop.lookahead = function (ms) {
    if (!arguments.length) return lookahead
    lookahead = ms
    return loop
  }
  loop.scheduleAheadTime = function (s) {
    if (!arguments.length) return scheduleAheadTime
    scheduleAheadTime = s
    return loop
  }
  loop.limit = function (n) {
    if (!arguments.length) return limit
    limit = n
    return loop
  }
  loop.tick = function (f) {
    if (!arguments.length) return tick
    tick = f
    return loop
  }
  loop.each = function (f) {
    if (!arguments.length) return each
    each = f
    return loop
  }
  loop.start = function (t) {
    running = true
    nextTickTime = t || ctx.currentTime
    scheduler()
    return loop
  }
  loop.stop = function () {
    window.clearTimeout(timer)
    running = false
    return loop
  }
  loop.reset = function () {
    currentTick = 0
    iterations = 0
    return loop
  }
  loop.running = function () {
    return running
  }

  return loop
}

},{}],2:[function(require,module,exports){
var riot = require('riot')
var scales = require('./keys.tag')
require('./vexflow.tag')
riot.mount(scales)

},{"./keys.tag":3,"./vexflow.tag":5,"riot":6}],3:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('scales', '<div> <h1>Scales demo { version }</h1> <select id="tonicSelect" onchange="{ tonicChanged }"> <option each="{ tonic in tonics }" value="{tonic}">{tonic}</option> </select> <select id="scaleType" onchange="{ scaleChanged }"> <option each="{ name in names }" value="{name}" __selected="{ name === \'major\' }">{name}</option> </select> <h3>{tonic} {name}</h3> <h5>Notes: { notes.join(\' \') }</h5> <vexflow notes="{ notes }"></vexflow> <a id="playBtn" onclick="{ play }" href="#">Play</a> </div>', function(opts) {

  var ctx = new AudioContext()
  var Soundfont = require('soundfont-player')
  var soundfont = new Soundfont(ctx)
  var instrument = soundfont.instrument('acoustic_grand_piano')
  var Clock = require('./clock.js')
  var reverse = require('tonal/list/reverse')
  var scale = require('tonal/scale/scale')
  var octaves = require('tonal/list/octaves')
  this.tonics = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ')
  this.names = ['major', 'minor']
  this.name = 'major'
  this.tonic = 'C'
  this.notes = notes(this.tonic, this.name)
  this.clock = null

  this.play = function(e) {
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
  }.bind(this);

  function notes(tonic, name) {
    var s = octaves(scale(tonic + ' ' + name ), 1)
    return s.concat(reverse(s.slice(0, -1)))
    return s
  }

  this.scaleChanged = function(e) {
    this.name = scaleType.value
    this.notes = notes(this.tonic, this.name)
  }.bind(this);

  this.tonicChanged = function(e) {
    this.tonic = tonicSelect.value
    this.notes = notes(this.tonic, this.name)
  }.bind(this);

});

},{"./clock.js":1,"riot":6,"soundfont-player":7,"tonal/list/octaves":21,"tonal/list/reverse":23,"tonal/scale/scale":28}],4:[function(require,module,exports){
var parse = require('tonal/note/parse')
var VexFlow = Vex.Flow

module.exports = function (canvas, width, height, notes) {
  var renderer = new VexFlow.Renderer(canvas, VexFlow.Renderer.Backends.CANVAS)
  var ctx = renderer.getContext()
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'black'
  var stave = new VexFlow.Stave(10, 0, width)
  stave.addClef('treble').setContext(ctx).draw()

  var tickables = notes.map(function (name) {
    var note = parse(name)
    var staveNote = new VexFlow.StaveNote({ keys: [note.letter + note.acc + '/' + note.oct], duration: 'q' })
    if (note.acc) {
      staveNote.addAccidental(0, new VexFlow.Accidental(note.acc))
    }
    return staveNote
  })
  tickables.push(new VexFlow.BarNote({
    type: VexFlow.Barline.END
  }))
  var voice = new VexFlow.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: VexFlow.RESOLUTION
  })
  voice.mode = VexFlow.Voice.Mode.SOFT

  // Add notes to voice
  voice.addTickables(tickables)

  // Format and justify the notes to width pixels
  var formatter = new VexFlow.Formatter()
  formatter.joinVoices([voice]).format([voice], width)

  // Render voice
  voice.draw(ctx, stave)
}

},{"tonal/note/parse":26}],5:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('vexflow', '<div> <canvas id="vex" width="800" height="100"></canvas> </div>', function(opts) {
    var vexflow = require('./vexflow.js')
    this.on('update', function() {
      vexflow(this.vex, 800, 100, this.opts.notes)
    })
  
});

},{"./vexflow.js":4,"riot":6}],6:[function(require,module,exports){
/* Riot v2.2.4, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window, undefined) {
  'use strict';
var riot = { version: 'v2.2.4', settings: {} },
  //// be aware, internal usage

  // counter to give a unique id to all the Tag instances
  __uid = 0,

  // riot specific prefixes
  RIOT_PREFIX = 'riot-',
  RIOT_TAG = RIOT_PREFIX + 'tag',

  // for typeof == '' comparisons
  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',
  // special native tags that cannot be treated like the others
  SPECIAL_TAGS_REGEX = /^(?:opt(ion|group)|tbody|col|t[rhd])$/,
  RESERVED_WORDS_BLACKLIST = ['_item', '_id', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],

  // version# for IE 8-11, 0 for others
  IE_VERSION = (window && window.document || {}).documentMode | 0,

  // Array.isArray for IE8 is in the polyfills
  isArray = Array.isArray

riot.observable = function(el) {

  el = el || {}

  var callbacks = {},
      _id = 0

  el.on = function(events, fn) {
    if (isFunction(fn)) {
      if (typeof fn.id === T_UNDEF) fn._id = _id++

      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else {
      events.replace(/\S+/g, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
            if (cb._id == fn._id) arr.splice(i--, 1)
          }
        } else {
          callbacks[name] = []
        }
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    function on() {
      el.off(name, on)
      fn.apply(el, arguments)
    }
    return el.on(name, on)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }
    }

    if (callbacks.all && name != 'all') {
      el.trigger.apply(el, ['all', name].concat(args))
    }

    return el
  }

  return el

}
riot.mixin = (function() {
  var mixins = {}

  return function(name, mixin) {
    if (!mixin) return mixins[name]
    mixins[name] = mixin
  }

})()

;(function(riot, evt, win) {

  // browsers only
  if (!win) return

  var loc = win.location,
      fns = riot.observable(),
      started = false,
      current

  function hash() {
    return loc.href.split('#')[1] || ''   // why not loc.hash.splice(1) ?
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  r.stop = function () {
    if (started) {
      if (win.removeEventListener) win.removeEventListener(evt, emit, false) //@IE8 - the if()
      else win.detachEvent('on' + evt, emit) //@IE8
      fns.off('*')
      started = false
    }
  }

  r.start = function () {
    if (!started) {
      if (win.addEventListener) win.addEventListener(evt, emit, false) //@IE8 - the if()
      else win.attachEvent('on' + evt, emit) //IE8
      started = true
    }
  }

  // autostart the router
  r.start()

})(riot, 'hashchange', window)
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/


var brackets = (function(orig) {

  var cachedBrackets,
      r,
      b,
      re = /[{}]/g

  return function(x) {

    // make sure we use the current setting
    var s = riot.settings.brackets || orig

    // recreate cached vars if needed
    if (cachedBrackets !== s) {
      cachedBrackets = s
      b = s.split(' ')
      r = b.map(function (e) { return e.replace(/(?=.)/g, '\\') })
    }

    // if regexp given, rewrite it with current brackets (only if differ from default)
    return x instanceof RegExp ? (
        s === orig ? x :
        new RegExp(x.source.replace(re, function(b) { return r[~~(b === '}')] }), x.global ? 'g' : '')
      ) :
      // else, get specific bracket
      b[x]
  }
})('{ }')


var tmpl = (function() {

  var cache = {},
      OGLOB = '"in d?d:' + (window ? 'window).' : 'global).'),
      reVars =
      /(['"\/])(?:[^\\]*?|\\.|.)*?\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function\s*\()|([A-Za-z_$]\w*)/g

  // build a template (or get it from cache), render with data
  return function(str, data) {
    return str && (cache[str] || (cache[str] = tmpl(str)))(data)
  }


  // create a template instance

  function tmpl(s, p) {

    if (s.indexOf(brackets(0)) < 0) {
      // return raw text
      s = s.replace(/\n|\r\n?/g, '\n')
      return function () { return s }
    }

    // temporarily convert \{ and \} to a non-character
    s = s
      .replace(brackets(/\\{/g), '\uFFF0')
      .replace(brackets(/\\}/g), '\uFFF1')

    // split string to expression and non-expresion parts
    p = split(s, extract(s, brackets(/{/), brackets(/}/)))

    // is it a single expression or a template? i.e. {x} or <b>{x}</b>
    s = (p.length === 2 && !p[0]) ?

      // if expression, evaluate it
      expr(p[1]) :

      // if template, evaluate all expressions in it
      '[' + p.map(function(s, i) {

        // is it an expression or a string (every second part is an expression)
        return i % 2 ?

          // evaluate the expressions
          expr(s, true) :

          // process string parts of the template:
          '"' + s

            // preserve new lines
            .replace(/\n|\r\n?/g, '\\n')

            // escape quotes
            .replace(/"/g, '\\"') +

          '"'

      }).join(',') + '].join("")'

    return new Function('d', 'return ' + s
      // bring escaped { and } back
      .replace(/\uFFF0/g, brackets(0))
      .replace(/\uFFF1/g, brackets(1)) + ';')

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n|\r\n?/g, ' ')

      // trim whitespace, brackets, strip comments
      .replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w- "']+ *:/.test(s) ?

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      '[' +

          // extract key:val pairs, ignoring any nested objects
          extract(s,

              // name part: name:, "name":, 'name':, name :
              /["' ]*[\w- ]+["' ]*:/,

              // expression part: everything upto a comma followed by a name (see above) or end of line
              /,(?=["' ]*[\w- ]+["' ]*:)|}|$/
              ).map(function(pair) {

                // get key, val parts
                return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function(_, k, v) {

                  // wrap all conditional parts to ignore errors
                  return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",'

                })

              }).join('') +

        '].join(" ").trim()' :

      // if js expression, evaluate as javascript
      wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    s = s.trim()
    return !s ? '' : '(function(v){try{v=' +

      // prefix vars (name => data.name)
      s.replace(reVars, function(s, _, v) { return v ? '(("' + v + OGLOB + v + ')' : s }) +

      // default to empty string for falsy values except zero
      '}catch(e){}return ' + (nonull === true ? '!v&&v!==0?"":v' : 'v') + '}).call(d)'
  }


  // split string by an array of substrings

  function split(str, substrings) {
    var parts = []
    substrings.map(function(sub, i) {

      // push matched expression and part before it
      i = str.indexOf(sub)
      parts.push(str.slice(0, i), sub)
      str = str.slice(i + sub.length)
    })
    if (str) parts.push(str)

    // push the remaining part
    return parts
  }


  // match strings between opening and closing regexp, skipping any inner/nested matches

  function extract(str, open, close) {

    var start,
        level = 0,
        matches = [],
        re = new RegExp('(' + open.source + ')|(' + close.source + ')', 'g')

    str.replace(re, function(_, open, close, pos) {

      // if outer inner bracket, mark position
      if (!level && open) start = pos

      // in(de)crease bracket level
      level += open ? 1 : -1

      // if outer closing bracket, grab the match
      if (!level && close != null) matches.push(str.slice(start, pos + close.length))

    })

    return matches
  }

})()

/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and bellow

*/
// http://kangax.github.io/compat-table/es5/#ie8
// http://codeplanet.io/dropping-ie8/

var mkdom = (function (checkIE) {

  var rootEls = {
        'tr': 'tbody',
        'th': 'tr',
        'td': 'tr',
        'tbody': 'table',
        'col': 'colgroup'
      },
      GENERIC = 'div'

  checkIE = checkIE && checkIE < 10

  // creates any dom element in a div, table, or colgroup container
  function _mkdom(html) {

    var match = html && html.match(/^\s*<([-\w]+)/),
        tagName = match && match[1].toLowerCase(),
        rootTag = rootEls[tagName] || GENERIC,
        el = mkEl(rootTag)

    el.stub = true

    if (checkIE && tagName && (match = tagName.match(SPECIAL_TAGS_REGEX)))
      ie9elem(el, html, tagName, !!match[1])
    else
      el.innerHTML = html

    return el
  }

  // creates tr, th, td, option, optgroup element for IE8-9
  /* istanbul ignore next */
  function ie9elem(el, html, tagName, select) {

    var div = mkEl(GENERIC),
        tag = select ? 'select>' : 'table>',
        child

    div.innerHTML = '<' + tag + html + '</' + tag

    child = div.getElementsByTagName(tagName)[0]
    if (child)
      el.appendChild(child)

  }
  // end ie9elem()

  return _mkdom

})(IE_VERSION)

// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
      els = expr.trim().slice(b0.length).match(/^\s*(\S+?)\s*(?:,\s*(\S+))?\s+in\s+(.+)$/)
  return els ? { key: els[1], pos: els[2], val: b0 + els[3] } : { val: expr }
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var tagName = getTagName(dom),
      template = dom.outerHTML,
      hasImpl = !!tagImpl[tagName],
      impl = tagImpl[tagName] || {
        tmpl: template
      },
      root = dom.parentNode,
      placeholder = document.createComment('riot placeholder'),
      tags = [],
      child = getTag(dom),
      checksum

  root.insertBefore(placeholder, dom)

  expr = loopKeys(expr)

  // clean template code
  parent
    .one('premount', function () {
      if (root.stub) root = parent.root
      // remove the original DOM node
      dom.parentNode.removeChild(dom)
    })
    .on('update', function () {
      var items = tmpl(expr.val, parent)

      // object loop. any changes cause full redraw
      if (!isArray(items)) {

        checksum = items ? JSON.stringify(items) : ''

        items = !items ? [] :
          Object.keys(items).map(function (key) {
            return mkitem(expr, key, items[key])
          })
      }

      var frag = document.createDocumentFragment(),
          i = tags.length,
          j = items.length

      // unmount leftover items
      while (i > j) {
        tags[--i].unmount()
        tags.splice(i, 1)
      }

      for (i = 0; i < j; ++i) {
        var _item = !checksum && !!expr.key ? mkitem(expr, items[i], i) : items[i]

        if (!tags[i]) {
          // mount new
          (tags[i] = new Tag(impl, {
              parent: parent,
              isLoop: true,
              hasImpl: hasImpl,
              root: SPECIAL_TAGS_REGEX.test(tagName) ? root : dom.cloneNode(),
              item: _item
            }, dom.innerHTML)
          ).mount()

          frag.appendChild(tags[i].root)
        } else
          tags[i].update(_item)

        tags[i]._item = _item

      }

      root.insertBefore(frag, placeholder)

      if (child) parent.tags[tagName] = tags

    }).one('updated', function() {
      var keys = Object.keys(parent)// only set new values
      walk(root, function(node) {
        // only set element node and not isLoop
        if (node.nodeType == 1 && !node.isLoop && !node._looped) {
          node._visited = false // reset _visited for loop node
          node._looped = true // avoid set multiple each
          setNamed(node, parent, keys)
        }
      })
    })

}


function parseNamedElements(root, tag, childTags) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop || (dom.parentNode && dom.parentNode.isLoop || dom.getAttribute('each')) ? 1 : 0

      // custom child tag
      var child = getTag(dom)

      if (child && !dom.isLoop) {
        childTags.push(initChildTag(child, dom, tag))
      }

      if (!dom.isLoop)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(brackets(0)) >= 0) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = dom.getAttribute('each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
      opts = inherit(conf.opts) || {},
      dom = mkdom(impl.tmpl),
      parent = conf.parent,
      isLoop = conf.isLoop,
      hasImpl = conf.hasImpl,
      item = cleanUpData(conf.item),
      expressions = [],
      childTags = [],
      root = conf.root,
      fn = impl.fn,
      tagName = root.tagName.toLowerCase(),
      attr = {},
      propsInSyncWithParent = []

  if (fn && root._tag) {
    root._tag.unmount(true)
  }

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop

  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  this._id = __uid++

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (brackets(/{.*}/).test(val)) attr[el.name] = val
  })

  if (dom.innerHTML && !/^(select|optgroup|table|tbody|tr|col(?:group)?)$/.test(tagName))
    // replace all the yield tags with the tag inner html
    dom.innerHTML = replaceYield(dom.innerHTML, innerHTML)

  // options
  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    // update opts from current DOM attributes
    each(root.attributes, function(el) {
      opts[el.name] = tmpl(el.value, ctx)
    })
    // recover those with expressions
    each(Object.keys(attr), function(name) {
      opts[name] = tmpl(attr[name], ctx)
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF)
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    if (!self.parent || !isLoop) return
    each(Object.keys(self.parent), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !~RESERVED_WORDS_BLACKLIST.indexOf(k) && ~propsInSyncWithParent.indexOf(k)
      if (typeof self[k] === T_UNDEF || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = self.parent[k]
      }
    })
  }

  this.update = function(data) {
    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent
    inheritFromParent()
    // normalize the tag properties in case an item object was initially passed
    if (data && typeof item === T_OBJECT) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self)
    self.trigger('updated')
  }

  this.mixin = function() {
    each(arguments, function(mix) {
      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix
      each(Object.keys(mix), function(key) {
        // bind methods to self
        if (key != 'init')
          self[key] = isFunction(mix[key]) ? mix[key].bind(self) : mix[key]
      })
      // init method will be called automatically
      if (mix.init) mix.init.bind(self)()
    })
  }

  this.mount = function() {

    updateOpts()

    // initialiation
    if (fn) fn.call(self, opts)

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    // mount the child tags
    toggle(true)

    // update the root adding custom attributes coming from the compiler
    // it fixes also #1087
    if (impl.attrs || hasImpl) {
      walkAttributes(impl.attrs, function (k, v) { root.setAttribute(k, v) })
      parseExpressions(self.root, self, expressions)
    }

    if (!self.parent || isLoop) self.update(item)

    // internal use only, fixes #403
    self.trigger('premount')

    if (isLoop && !hasImpl) {
      // update the root attribute for the looped elements
      self.root = root = dom.firstChild

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) self.root = root = parent.root
    }
    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  }


  this.unmount = function(keepRootTag) {
    var el = root,
        p = el.parentNode,
        ptag

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (isArray(ptag.tags[tagName]))
          each(ptag.tags[tagName], function(tag, i) {
            if (tag._id == self._id)
              ptag.tags[tagName].splice(i, 1)
          })
        else
          // otherwise just delete the tag instance
          ptag.tags[tagName] = undefined
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else
        // the riot-tag attribute isn't needed anymore, remove it
        p.removeAttribute('riot-tag')
    }


    self.trigger('unmount')
    toggle()
    self.off('*')
    // somehow ie8 does not like `delete root._tag`
    root._tag = null

  }

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (parent) {
      var evt = isMount ? 'on' : 'off'

      // the loop tags will be always in sync with the parent automatically
      if (isLoop)
        parent[evt]('unmount', self.unmount)
      else
        parent[evt]('update', self.update)[evt]('unmount', self.unmount)
    }
  }

  // named elements available for fn
  parseNamedElements(dom, this, childTags)


}

function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var item = tag._item,
        ptag = tag.parent,
        el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag.parent
      }

    // cross browser event fix
    e = e || window.event

    // ignore error on some browsers
    try {
      e.currentTarget = dom
      if (!e.target) e.target = e.srcElement
      if (!e.which) e.which = e.charCode || e.keyCode
    } catch (ignored) { /**/ }

    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}

// used by if- attribute
function insertTo(root, node, before) {
  if (root) {
    root.insertBefore(before, node)
    root.removeChild(node)
  }
}

function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
        attrName = expr.attr,
        value = tmpl(expr.expr, tag),
        parent = expr.dom.parentNode

    if (expr.bool)
      value = value ? attrName : false
    else if (value == null)
      value = ''

    // leave out riot- prefixes from strings inside textarea
    // fix #815: any value -> string
    if (parent && parent.tagName == 'TEXTAREA') value = ('' + value).replace(/riot-/g, '')

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attrName) {
      dom.nodeValue = '' + value    // #815 related
      return
    }

    // remove original attribute
    remAttr(dom, attrName)
    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub,
          add = function() { insertTo(stub.parentNode, stub, dom) },
          remove = function() { insertTo(dom.parentNode, dom, stub) }

      // add to DOM
      if (value) {
        if (stub) {
          add()
          dom.inStub = false
          // avoid to trigger the mount event if the tags is not visible yet
          // maybe we can optimize this avoiding to mount the tag at all
          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted) el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }
      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        // if the parentNode is defined we can easily replace the tag
        if (dom.parentNode)
          remove()
        else
        // otherwise we need to wait the updated event
          (tag.parent || tag).one('updated', remove)

        dom.inStub = true
      }
    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
      if (value)
        dom.setAttribute(attrName.slice(RIOT_PREFIX.length), value)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (typeof value !== T_OBJECT) dom.setAttribute(attrName, value)

    }

  })

}
function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]
    // return false -> remove current item during loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

function isFunction(v) {
  return typeof v === T_FUNCTION || false   // avoid IE problems
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function getTag(dom) {
  return dom.tagName && tagImpl[dom.getAttribute(RIOT_TAG) || dom.tagName.toLowerCase()]
}

function initChildTag(child, dom, parent) {
  var tag = new Tag(child, { root: dom, parent: parent }, dom.innerHTML),
      tagName = getTagName(dom),
      ptag = getImmediateCustomParentTag(parent),
      cachedTag

  // fix for the parent attribute in the looped elements
  tag.parent = ptag

  cachedTag = ptag.tags[tagName]

  // if there are multiple children tags having the same name
  if (cachedTag) {
    // if the parent tags property is not yet an array
    // create it adding the first cached tag
    if (!isArray(cachedTag))
      ptag.tags[tagName] = [cachedTag]
    // add the new nested tag to the array
    if (!~ptag.tags[tagName].indexOf(tag))
      ptag.tags[tagName].push(tag)
  } else {
    ptag.tags[tagName] = tag
  }

  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  dom.innerHTML = ''

  return tag
}

function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (!getTag(ptag.root)) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

function getTagName(dom) {
  var child = getTag(dom),
    namedTag = dom.getAttribute('name'),
    tagName = namedTag && namedTag.indexOf(brackets(0)) < 0 ? namedTag : child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if ((obj = args[i])) {
      for (var key in obj) {      // eslint-disable-line guard-for-in
        src[key] = obj[key]
      }
    }
  }
  return src
}

// with this function we avoid that the current Tag methods get overridden
function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION)) return data

  var o = {}
  for (var key in data) {
    if (!~RESERVED_WORDS_BLACKLIST.indexOf(key))
      o[key] = data[key]
  }
  return o
}

function walk(dom, fn) {
  if (dom) {
    if (fn(dom) === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

// minimize risk: only zero or one _space_ between attr & value
function walkAttributes(html, fn) {
  var m,
      re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while ((m = re.exec(html))) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

function mkEl(name) {
  return document.createElement(name)
}

function replaceYield(tmpl, innerHTML) {
  return tmpl.replace(/<(yield)\/?>(<\/\1>)?/gi, innerHTML || '')
}

function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

function setNamed(dom, parent, keys) {
  if (dom._visited) return
  var p,
      v = dom.getAttribute('id') || dom.getAttribute('name')

  if (v) {
    if (keys.indexOf(v) < 0) {
      p = parent[v]
      if (!p)
        parent[v] = dom
      else if (isArray(p))
        p.push(dom)
      else
        parent[v] = [p, dom]
    }
    dom._visited = true
  }
}

// faster String startsWith alternative
function startsWith(src, str) {
  return src.slice(0, str.length) === str
}

/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtualDom = [],
    tagImpl = {},
    styleNode

function injectStyle(css) {

  if (riot.render) return // skip injection on the server

  if (!styleNode) {
    styleNode = mkEl('style')
    styleNode.setAttribute('type', 'text/css')
  }

  var head = document.head || document.getElementsByTagName('head')[0]

  if (styleNode.styleSheet)
    styleNode.styleSheet.cssText += css
  else
    styleNode.innerHTML += css

  if (!styleNode._rendered)
    if (styleNode.styleSheet) {
      document.body.appendChild(styleNode)
    } else {
      var rs = $('style[type=riot]')
      if (rs) {
        rs.parentNode.insertBefore(styleNode, rs)
        rs.parentNode.removeChild(rs)
      } else head.appendChild(styleNode)

    }

  styleNode._rendered = true

}

function mountTo(root, tagName, opts) {
  var tag = tagImpl[tagName],
      // cache the inner HTML to fix #855
      innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    virtualDom.push(tag)
    return tag.on('unmount', function() {
      virtualDom.splice(virtualDom.indexOf(tag), 1)
    })
  }

}

riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else injectStyle(css)
  }
  tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

riot.mount = function(selector, tagName, opts) {

  var els,
      allTags,
      tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      list += ', *[' + RIOT_TAG + '="' + e.trim() + '"]'
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    var last
    if (root.tagName) {
      if (tagName && (!(last = root.getAttribute(RIOT_TAG)) || last != tagName))
        root.setAttribute(RIOT_TAG, tagName)

      var tag = mountTo(root,
        tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    }
    else if (root.length) {
      each(root, pushTags)   // assume nodeList
    }
  }

  // ----- mount code -----

  if (typeof tagName === T_OBJECT) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*')
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    else
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(','))

    els = $$(selector)
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName)
      els = $$(tagName, els)
    else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  if (els.tagName)
    pushTags(els)
  else
    each(els, pushTags)

  return tags
}

// update everything
riot.update = function() {
  return each(virtualDom, function(tag) {
    tag.update()
  })
}

// @deprecated
riot.mountTo = riot.mount

  // share methods for other riot parts, e.g. compiler
  riot.util = { brackets: brackets, tmpl: tmpl }

  // support CommonJS, AMD & browser
  /* istanbul ignore next */
  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === 'function' && define.amd)
    define(function() { return (window.riot = riot) })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);

},{}],7:[function(require,module,exports){
'use strict'

var base64DecodeToArray = require('./lib/b64decode.js')
var parseNote = require('note-parser')

function Soundfont (audioContext) {
  if (!(this instanceof Soundfont)) return new Soundfont(audioContext)
  this.ctx = audioContext
  this.instruments = {}
  this.promises = []
}

Soundfont.prototype.instrument = function (name) {
  if (!name) return createDefaultInstrument(this.ctx, 'default')
  var inst = this.instruments[name]
  if (!inst) {
    var ctx = this.ctx
    inst = createDefaultInstrument(ctx, name)
    var promise = Soundfont.loadBuffers(ctx, name).then(function (buffers) {
      var realInst = createInstrument(ctx, name, buffers)
      inst.play = realInst.play
    })
    this.promises.push(promise)
    inst.onready = function (callback) {
      return promise.then(callback)
    }
    this.instruments[name] = inst
  }
  return inst
}

Soundfont.prototype.onready = function (callback) {
  Promise.all(this.promises).then(callback)
}

Soundfont.noteToMidi = function (note) {
  if (!note) return null
  if (note.midi) return note.midi
  if (!isNaN(note)) return note
  else return parseNote(note).midi
}

/*
 * Soundfont.nameToUrl
 * Given an instrument name returns a URL to its Soundfont js file
 *
 * @param {String} name - instrument name
 * @returns {String} the Soundfont data url
 */
Soundfont.nameToUrl = function (name) {
  return 'https://cdn.rawgit.com/gleitz/midi-js-Soundfonts/master/FluidR3_GM/' + name + '-ogg.js'
}

/*
 * SoundFont.getScript
 *
 * Given a script URL returns a Promise with the script contents as text
 * @param {String} url - the URL
 */
Soundfont.loadData = function (url) {
  return new Promise(function (done, reject) {
    var req = new window.XMLHttpRequest()
    req.open('GET', url)

    req.onload = function () {
      if (req.status === 200) {
        done(req.response)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(Error('Network Error'))
    }
    req.send()
  })
}

/*
 *  Parse the SoundFont data and return a JSCON object
 *  (SoundFont data are .js files wrapping json data)
 *
 * @param {String} data - the SoundFont js file content
 * @returns {JSON} the parsed data as JSON object
 */
Soundfont.dataToJson = function (data) {
  var begin = data.indexOf('MIDI.Soundfont.')
  begin = data.indexOf('=', begin) + 2
  var end = data.lastIndexOf(',')
  return JSON.parse(data.slice(begin, end) + '}')
}

/*
 * loadBuffers
 *
 * Given a Web Audio context and a instrument name
 * load the instrument data and return a hash of audio buffers
 *
 * @param {Object} ctx - A Web Audio context
 * @param {String} name - the sounfont instrument name
 */
Soundfont.loadBuffers = function (ctx, name) {
  return Promise.resolve(name)
    .then(Soundfont.nameToUrl)
    .then(Soundfont.loadData)
    .then(Soundfont.dataToJson)
    .then(function (jsonData) {
      return createBank(ctx, name, jsonData)
    })
    .then(decodeBank)
    .then(function (bank) {
      return bank.buffers
    })
}

/*
 * @param {Object} ctx - Web Audio context
 * @param {String} name - The bank name
 * @param {Object} data - The Soundfont instrument data as JSON
 */
function createBank (ctx, name, data) {
  var bank = { ctx: ctx, name: name, data: data }
  bank.buffers = {}

  return bank
}

/*
 * INTENAL: decodeBank
 * Given an instrument, returns a Promise that resolves when
 * all the notes from de instrument are decoded
 */
function decodeBank (bank) {
  var promises = Object.keys(bank.data).map(function (note) {
    return decodeNote(bank.ctx, bank.data[note])
      .then(function (buffer) {
        note = parseNote(note)
        bank.buffers[note.midi] = buffer
      })
  })

  return Promise.all(promises).then(function () {
    return bank
  })
}

/*
 * Given a WAA context and a base64 encoded buffer data returns
 * a Promise that resolves when the buffer is decoded
 */
function decodeNote (context, data) {
  return new Promise(function (done, reject) {
    var decodedData = base64DecodeToArray(data.split(',')[1]).buffer
    context.decodeAudioData(decodedData, function (buffer) {
      done(buffer)
    }, function (e) {
      reject('DecodeAudioData error', e)
    })
  })
}

/*
 * createDefaultInstrument
 */
function createDefaultInstrument (context, name) {
  var instrument = {
    name: name,
    play: function (note, time, duration, options) {
      note = parseNote(note)
      options = options || {}
      var gain = options.gain || 0.2
      var vcoType = options.vcoType || 'sine'

      var vco = context.createOscillator()
      vco.type = vcoType
      vco.frequency.value = note.freq

      /* VCA */
      var vca = context.createGain()
      vca.gain.value = gain

      /* Connections */
      vco.connect(vca)
      vca.connect(context.destination)

      vco.start(time)
      vco.stop(time + duration)
      return vco
    }
  }
  return instrument
}

function createInstrument (audioContext, name, buffers) {
  var instrument = {
    name: name,
    play: function (note, time, duration) {
      var midi = Soundfont.noteToMidi(note)
      var buffer = buffers[midi]
      if (!buffer) {
        console.log('WARNING: Note buffer not found: ', note)
        return
      }
      var source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start(time)
      if (duration) source.stop(time + duration)
      return source
    }
  }
  return instrument
}

if (typeof module === 'object' && module.exports) module.exports = Soundfont
if (typeof window !== 'undefined') window.Soundfont = Soundfont

},{"./lib/b64decode.js":8,"note-parser":9}],8:[function(require,module,exports){
'use strict'

function b64ToUint6 (nChr) {
  return nChr > 64 && nChr < 91 ?
    nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
      : nChr > 47 && nChr < 58 ?
        nChr + 4
        : nChr === 43 ?
          62
          : nChr === 47 ?
            63
            :
            0

}

// Decode Base64 to Uint8Array
// ---------------------------
function base64DecodeToArray (sBase64, nBlocksSize) {
  var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '')
  var nInLen = sB64Enc.length
  var nOutLen = nBlocksSize ?
    Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize :
    nInLen * 3 + 1 >> 2
  var taBytes = new Uint8Array(nOutLen)

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
      }
      nUint24 = 0
    }
  }
  return taBytes
}

module.exports = base64DecodeToArray

},{}],9:[function(require,module,exports){
'use strict';

var NOTE = /^([a-gA-G])(#{0,2}|b{0,2})(-?\d{0,1})$/
/*
 * parseNote
 *
 * @param {String} note - the note string to be parsed
 * @return {Object} a object with the following attributes:
 * - pc: pitchClass, the letter of the note, ALWAYS in lower case
 * - acc: the accidentals (or '' if no accidentals)
 * - oct: the octave as integer. By default is 4
 */
var parse = function(note, defaultOctave, defaultValue) {
  var parsed, match;
  if(typeof(note) === 'string' && (match = NOTE.exec(note))) {
    var octave = match[3] !== '' ? +match[3] : (defaultOctave || 4);
    parsed = { pc: match[1].toLowerCase(),
      acc: match[2], oct: octave };
  } else if(typeof(note.pc) !== 'undefined'
    && typeof(note.acc) !== 'undefined'
    && typeof(note.oct) !== 'undefined') {
    parsed = note;
  }

  if (parsed) {
    parsed.midi = parsed.midi || toMidi(parsed);
    parsed.freq = parsed.freq || midiToFrequency(parsed.midi);
    return parsed;
  } else if (typeof(defaultValue) !== 'undefined') {
    return defaultValue;
  } else {
    throw Error("Invalid note format: " + note);
  }
}

parse.toString = function(obj) {
  return obj.pc + obj.acc + obj.oct;
}

var SEMITONES = {c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
function toMidi(note) {
  var alter = note.acc.length;
  if(note.acc[0] === 'b') alter = -1 * alter;
  return SEMITONES[note.pc] + alter + 12 * (note.oct + 1);
}
function midiToFrequency (note) {
    return Math.pow(2, (note-69)/12)*440;
}

module.exports = parse;

},{}],10:[function(require,module,exports){
var strict = require('../utils/strict')
var parse = strict('Interval not valid', require('./parse'))
var interval = require('./interval')

/**
 * Add two intervals
 *
 * @param {String} interval1 - the first interval
 * @param {String} interval2 - the second interval
 * @return {String} the resulting interval
 *
 * @example
 * add('M2', 'M2') // => 'M3'
 */
function add (i1, i2) {
  if (arguments.length === 1) {
    return function (i2) {
      return add(i1, i2)
    }
  }
  i1 = parse(i1)
  i2 = parse(i2)

  var num = i1.dir * (i1.num - 1) + i2.dir * (i2.num - 1)
  num = num < 0 ? -num + 1 : num + 1
  var size = i1.semitones + i2.semitones
  return fromNumAndSize(num, size)
}

module.exports = add

// create an interval from a number and a size
function fromNumAndSize (num, size) {
  if (num === -1) num = 1
  var dir = size < 0
  // create a reference interval
  var ref = parse(interval(num))
  var refSize = ref.semitones
  // get the difference in sizes
  var diff = Math.abs(size) - refSize
  var oct = Math.floor(Math.abs(diff) / 12)
  diff = diff % 12

  return interval(num, diff, oct, dir).name
}

},{"../utils/strict":32,"./interval":12,"./parse":14}],11:[function(require,module,exports){
var strict = require('../utils/strict')
var parse = strict('Note not valid', require('../note/parse'))
var interval = require('./interval')

var STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
/**
 * Get the interval between two notes
 *
 * This is the function to calculate distances (expressed in intervals) for
 * two notes. An alias of this function is in `note/distance`
 *
 * This is an 'strict' function: if the notes are note valid, an
 * exception is thrown.
 *
 * You can get a _curryfied_ version of this function by passing only one
 * parameter. See examples below:
 *
 * @param {String} from - first note
 * @param {String} to - second note
 * @return {String} the interval between notes
 *
 * @example
 * fromNotes('C', 'D') // => 'M2'
 * ['C', 'D', 'Eb'].map(fromNotes('C')) // => ['P1', 'M2', 'm3']
 */
function fromNotes (from, to) {
  if (arguments.length === 1) {
    return function (to) {
      return fromNotes(from, to)
    }
  }

  from = parse(from)
  to = parse(to)
  var num = STEPS.indexOf(to.letter) - STEPS.indexOf(from.letter)
  num = num < 0 ? num + 8 : num + 1
  var alter = to.alter - from.alter
  var oct = to.oct - from.oct
  return interval(num, alter, oct).name
}

module.exports = fromNotes

},{"../note/parse":26,"../utils/strict":32,"./interval":12}],12:[function(require,module,exports){
var parse = require('./parse')

var QUALITIES = {
  P: {'-2': 'dd', '-1': 'd', 0: 'P', 1: 'A', 2: 'AA'},
  M: {'-3': 'dd', '-2': 'd', '-1': 'm', 0: 'M', 1: 'A', 2: 'AA'}
}

/**
 * Create a interval from its components
 *
 * @param {Integer} num - the interval number
 * @param {Integer} alter - the interval alteration (0 is perfect or major)
 * @param {Integer} oct - (Optional) the octaves, 0 by default
 * @param {boolean} descending - (Optional) create a descending interval (false
 * by default)
 *
 * @example
 * interval(1) // => 'P1'
 * interval(1, 1) // => 'A1'
 * interval(1, 1, 2) // => 'A8'
 * interval(1, 1, 2, -1) // => 'A-8'
 * interval(2, -1, 2, -1) // => 'm-9'
 */
function interval (num, alter, oct, dir) {
  if (isNaN(num)) {
    var i = parse(num)
    alter = isNaN(alter) ? i.alter : alter
    oct = isNaN(oct) ? i.oct : oct
    dir = isNaN(dir) ? i.dir : dir
    q = QUALITIES[i.type][alter] || i.quality
    return q ? parse(q + dir * (i.num + 7 * oct)) : null
  } else {
    if (num === 0) throw Error('0 is not a valid interval number.')
    var simple = num > 8 ? (num % 7 || 7) : num
    var type = (simple === 1 || simple === 4 || simple === 5 || simple === 8) ? 'P' : 'M'
    alter = alter || 0
    oct = oct || 0
    dir = dir ? -1 : 1
    var q = QUALITIES[type][alter]
    return q ? parse(q + dir * (num + 7 * oct)) : null
  }
}

module.exports = interval

},{"./parse":14}],13:[function(require,module,exports){
var parse = require('./parse')
/**
 * Test if a string is a valid interval
 *
 * @param {String} interval - the interval to be tested
 * @return {Boolean} true if its a valid interval
 *
 * @example
 * isInterval('blah') // false
 * isInterval('P5') // true
 * isInterval('P6') // false
 */
function isInterval (interval) {
  return parse(interval) !== null
}

module.exports = isInterval

},{"./parse":14}],14:[function(require,module,exports){
'use strict'

var REGEX = /^(dd|d|m|M|P|A|AA)(-?)(\d+)$/
// size in semitones to generic semitones in non altered state
// last 0 is beacuse P8 is oct = 1
var SEMITONES = [null, 0, 2, 4, 5, 7, 9, 11, 0]
// alteration values
var ALTERS = {
  P: { dd: -2, d: -1, P: 0, A: 1, AA: 2 },
  M: { dd: -3, d: -2, m: -1, M: 0, A: 1, AA: 2 }
}

/**
 * Parse an interval and get its properties
 *
 * Probably you will want to use `interval/interval` instead.
 *
 * This method retuns an object with the following properties:
 * - name: the parsed interval
 * - quality: the quality (one of `dmPMA` for dimished, minor, perfect, major and
 * augmented respectively)
 * - num: diatonic number (a positive integer bigger that 0)
 * - alter: an integer with the alteration respect to 'P' or 'M' (depending on the type)
 * - dir: direction, 1 for ascending intervals, -1 for descending ones
 * - oct: the number of octaves (a positive integer)
 * - type: the interval type. 'P' for 'perfect', 'M' for major. This is not the
 * quality of the interval, just if it is perfectable or not.
 * - semitones: the size of the interval in semitones
 *
 * @param {String} name - the name of the interval to be parsed
 * @return {Array} a interval object or null if not a valid interval
 *
 * @name parse
 * @module interval
 * @see interval/interval
 *
 * @example
 * var parse = require('tonal/interval/parse')
 * parse('P-5') // => {quality: 'P', dir: -1, num: 5, generic: 4, alter: 0, perfectable: true }
 * parse('m9') // => {quality: 'm', dir: 1, num: 9, generic: 1, alter: -1, perfectable: false }
 */
function parse (interval) {
  var m = REGEX.exec(interval)
  if (!m) return null // not valid interval

  var num = +m[3]
  if (num === 0) return null

  var q = m[1]
  var dir = m[2] === '' ? 1 : -1
  var simple = num > 8 ? (num % 7 || 7) : num
  var type = (simple === 1 || simple === 4 || simple === 5 || simple === 8) ? 'P' : 'M'
  if (q === 'M' && type === 'P' || q === 'P' && type !== 'P') return null
  var alt = ALTERS[type][q]
  if (alt == null) return null
  var oct = Math.floor((num - 1) / 7)
  var semitones = dir * ((SEMITONES[simple] + alt) + 12 * oct)

  return { name: m[0], quality: q, dir: dir, num: num, simple: simple,
    perfectable: type === 'P', oct: oct, alter: alt,
    semitones: semitones, type: type }
}

var memoize = require('../utils/fastMemoize')
var coerce = require('../utils/coerceParam')
module.exports = coerce('name', memoize(parse))

},{"../utils/coerceParam":30,"../utils/fastMemoize":31}],15:[function(require,module,exports){
var strict = require('../utils/strict')
var parseNote = strict('Note not valid', require('../note/parse'))
var toNote = require('../note/note')
var parseInterval = strict('Interval not valid', require('./parse'))
var isInterval = require('./isInterval')

var LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/**
 * Transpose a note by an interval
 *
 * This is the principal function of interval module. You should be able to
 * transpose any note with any interval. (if not, is a bug ;-)
 *
 * You can also get a currified version by passing one parameter instead
 * of two. For example, with `transpose('M2')` you get a function that transposes
 * any note by a 'M2' interval. The same way, with `transpose('C4')` you get
 * a function that transposes C4 to the given interval. See examples below.
 *
 * This is an _strict_ function: if note or interval are not valid, an exception
 * is thrown
 *
 * @param {String} interval - the interval to tranpose
 * @param {String} note - the note to be transposed
 * @return {String} the resulting note
 *
 * @example
 * transpose('M2', 'E') // => 'F#4'
 * transpose('M-2', 'C') // => 'Bb3'
 * ['C', 'D', 'E'].map(transpose('M2')) // => ['D4', 'E4', 'F#4']
 * ['M2', 'm3', 'P-8'].map(tranapose('C')) // => ['D4', 'Eb4', 'C3']
 */
function transpose (interval, note) {
  // return a currified function if arguments == 0

  // parse interval and notes in strict mode
  var i = parseInterval(interval)
  var n = parseNote(note)

  var oct = n.oct + i.dir * i.oct

  // if its a perfect octave, do a short path
  if (i.quality === 'P' && (i.simple === 8 || i.simple === 1)) {
    return n.pitchClass + oct
  }

  var letterIndex = LETTERS.indexOf(n.letter) + i.dir * (i.simple - 1)
  if (letterIndex > 6) {
    letterIndex = letterIndex % 7
    oct++
  } else if (letterIndex < 0) {
    letterIndex += 7
    oct--
  }
  var dest = toNote(LETTERS[letterIndex], 0, oct)
  return toNote(dest, i.semitones - (dest.midi - n.midi), oct).name
}

module.exports = function (interval, note) {
  if (arguments.length === 1) {
    var param = arguments[0]
    return function (other) {
      if (isInterval(param)) return transpose(param, other)
      else return transpose(other, param)
    }
  } else {
    return transpose(interval, note)
  }
}

},{"../note/note":25,"../note/parse":26,"../utils/strict":32,"./isInterval":13,"./parse":14}],16:[function(require,module,exports){
var notes = require('../list/notes')
var intervals = require('../list/intervals')

/**
 * Create a list dictionary from a hash map data and a name parser
 *
 * A list dictionary is a function that generates lists from keys. It uses
 * a parser to remove the tonic (if present) from the key. Then look up
 * into the hash for a name and pass it to a list generator.
 *
 * If the returned dictionary is called without arguments, a list of all keys
 * is returned
 *
 * If the name is not found in the hash data, it throws an exception
 *
 * The parser should receive one string and return an object with two string
 * properties:
 * - tonic: a note if any, or null
 * - type: (required) the key to lookfor
 *
 * The scale/scale and chord/chord functions uses this to create a generator.
 *
 * @param {Hash} data - the data hash (dictionary)
 * @param {Function} parser - a function that parses the name and returns
 * an object with tonic (if not present) and the name properties
 * @return {Function} the list dictionary
 *
 * @example
 * var listDict = require('tonal/data/listDict')
 * var scale = listDict({'major': 2773})
 * scale('C major') // => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
 * scale('major') // => ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']
 * // get keys:
 * scale() // => ['major']
 */
function listDict (data, parser) {
  parser = parser || parseName
  var keys = null
  return function (name) {
    // if no aguments, returns keys
    if (arguments.length === 0) {
      keys = keys || Object.keys(data).sort()
      return keys
    }

    // if its already a list, return it
    if (Array.isArray(name)) return name

    // parse the name
    var parsed = parser(name)
    var listIdentifier = data[parsed.type]
    if (!listIdentifier) throw Error('Name not found: ' + parsed.type)
    return parsed.tonic ? notes(listIdentifier, parsed.tonic) : intervals(listIdentifier)
  }
}

module.exports = listDict

var REGEX = /^([a-gA-G])?\s*(.*)$/
function parseName (name) {
  var m = REGEX.exec(name)
  return m ? { tonic: m[1], type: m[2] } : m
}

},{"../list/intervals":17,"../list/notes":20}],17:[function(require,module,exports){
var distance = require('../interval/fromNotes')
var toList = require('./list')

function intervals (list) {
  list = toList(list)
  if (!list) return null
  if (list[0] === 'P1' || list[0] === 'P-1') return list
  return list.map(distance(list[0]))
}

module.exports = intervals

},{"../interval/fromNotes":11,"./list":19}],18:[function(require,module,exports){
'use strict'

var BINARY = /^1[01]{11}$/

/**
 * Determine if a given number is a valid binary list number
 *
 * A valid binary list is a binary number with two conditions:
 * - its 12 digit long
 * - starts with 1 (P1 interval)
 *
 * The binary number can be expressed in decimal as well (i.e 2773)
 *
 * @param {String} number - the number to test
 * @return {boolean} true if its a valid scale binary number
 *
 * @example
 * isBinary('101010101010') // => true
 * isBinary(2773) // => true
 * isBinary('001010101010') // => false (missing first 1)
 * isBinary('1001') // => false
 */
function isBinaryList (number) {
  return BINARY.test(number.toString(2))
}

module.exports = isBinaryList

},{}],19:[function(require,module,exports){
var parse = require('./parse')
/**
 * Get a list of notes or isInterval
 *
 * This is the principal function to create lists. Basically does the same as
 * `list/parse` but if an array is given, it returns it without modification
 * or validation (so, only pass an array when you are sure that is a valid list)
 *
 * @param {String|Array} list - the list to be parsed or passed
 * @return {Array} an array list of notes or intervals (or anything it you pass
 * an array to the function)
 *
 * @example
 * list('c d# e5') // => ['C4', 'D#4', 'E5']
 * list('P1 m2') // => ['P1', 'm2']
 * list('bb2') // => ['Bb2']
 * list('101') // => ['P1', 'M2']
 * // to validate an array
 * list(['C#3', 'P2'].join(' ')) // => null
 */
function list (l) {
  if (Array.isArray(l)) return l
  else return parse(l)
}

module.exports = list

},{"./parse":22}],20:[function(require,module,exports){
var transpose = require('../interval/transpose')
var intervals = require('./intervals')
var toList = require('./list')

function notes (list, tonic) {
  list = toList(list)
  if (!list) return null

  if (list[0] === 'P1' || list[0] === 'P-1') {
    return list.map(transpose(tonic))
  } else {
    if (!tonic) return list
    return intervals(list).map(transpose(tonic))
  }
}

module.exports = notes

},{"../interval/transpose":15,"./intervals":17,"./list":19}],21:[function(require,module,exports){
var toList = require('./list')
var transpose = require('./transpose')
var interval = require('../interval/interval')

// TODO: check the list is smaller than an octave
/**
 * Return a list spanning a number of octaves
 *
 * @param {String|Array} list - the list
 * @param {Integer} number - the number of octaves
 * @return {Array} a list spanning the specified number of octaves
 *
 * @example
 * octaves('C D', 0) // => ['C4', 'D4']
 * octaves('C D', 1) // => ['C4', 'D4', 'C5']
 * octaves('C D', 2) // => ['C4', 'D4', 'C5', 'D5', 'C6']
 * octaves('P1 M2', 2) // => ['P1', 'M2', 'P8', 'M9', 'P15']
 */
function octaves (list, number) {
  list = toList(list)
  if (!number) return list
  var o = list
  for (var i = 1; i < number; i++) {
    o = o.concat(transpose(interval('P1', 0, i), list))
  }
  return o.concat(transpose(interval(1, 0, number), list[0]))
}

module.exports = octaves

},{"../interval/interval":12,"./list":19,"./transpose":24}],22:[function(require,module,exports){
var isBinary = require('./isBinary')
var toNote = require('../note/note')
var isInterval = require('../interval/isInterval')

/**
 * Parse a string to a note or interval list
 *
 * The string can be notes or intervals separated by white spaces or a binary
 * or decimal representation of a interval list
 *
 * @param {String|Integer} list - the string to be parsed
 * @return {Array} an array of notes or intervals, null if not valid list
 */
function parse (list) {
  if (isBinary(list)) return binaryIntervals(list.toString(2))
  else if (typeof list === 'string') list = list.split(' ')
  else return null

  var notes = toNotes(list)
  return notes ? notes : toIntervals(list)
}

module.exports = parse

var CHROMA = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7']
function binaryIntervals (binary) {
  var result = []
  for (var i = 0, len = binary.length; i < len; i++) {
    if (binary[i] === '1') result.push(CHROMA[i])
  }
  return result
}

function toNotes (list) {
  var note
  for (var i = 0, len = list.length; i < len; i++) {
    note = toNote(list[i])
    if (note === null) return null
    else list[i] = note.name
  }
  return list
}

function toIntervals (list) {
  if (list[0] !== 'P1' && list[0] !== 'P-1') return null
  for (var i = 1, len = list.length; i < len; i++) {
    if (!isInterval(list[i])) return null
  }
  return list
}

},{"../interval/isInterval":13,"../note/note":25,"./isBinary":18}],23:[function(require,module,exports){
'use strict'

var list = require('./list')
/**
 * Get the reverse (retrograde) of a list
 *
 * @param {String|Array|Integer} list - the list to be reversed
 * @return {Array} The reversed list
 *
 * @example
 * reverse('A B C') // => ['C', 'B', 'A']
 */
function reverse (forward) {
  if (Array.isArray(forward)) return forward.concat().reverse()
  else return list(forward).reverse()
}

module.exports = reverse

},{"./list":19}],24:[function(require,module,exports){
var trNote = require('../interval/transpose')
var isInterval = require('../interval/isInterval')
var trInterval = require('../interval/add')
var toList = require('./list')

function transpose (interval, list) {
  list = toList(list)
  var tr = isInterval(list[0]) ? trInterval : trNote
  return list.map(tr(interval))
}

module.exports = transpose

},{"../interval/add":10,"../interval/isInterval":13,"../interval/transpose":15,"./list":19}],25:[function(require,module,exports){
var parse = require('./parse')

var ACCIDENTALS = { '-4': 'bbbb', '-3': 'bbb', '-2': 'bb', '-1': 'b',
  0: '', 1: '#', 2: '##', 3: '###', 4: '####'}

/**
 * Create a note from its components (letter, octave, alteration)
 *
 * It returns the cannonical representation of a note (ie. 'C##2', 'Db3')
 * In tonal it means a string with:
 * - letter (in upper case)
 * - accidentals (with '#' or 'b', never 'x')
 * - a octave number (a positive decimal, always present)
 *
 * @param {String} note or step - a string with a note or a note letter
 * @param {Integer} alteration - (Optional) the alteration number. If not set
 * uses the alterations from the note (if present) or 0
 * @param {Integer} octave - (Optional) the note octave. If note set uses the
 * octave from the note (if present) or 4
 * @return {Object} an object with the note properties (@see note/parse)
 *
 * @module note
 *
 * @example
 * note('D', -2, 3) // => 'Dbb3'
 * note('G', 2, 1) // => 'G##1'
 * note('C', 1) // => 'C#4'
 * note('C##', -1) // => 'Cb4'
 * note('Cx') // => 'C##4'
 * note('Cx', null, 2) // => 'C##2'
 */
function note (note, acc, oct) {
  note = parse(note)
  if (!note) return null

  acc = acc ? ACCIDENTALS[acc] : note.acc
  if (acc === null) return null
  oct = oct ? oct : note.oct
  return parse(note.letter + acc + oct)
}

module.exports = note

},{"./parse":26}],26:[function(require,module,exports){
var REGEX = /^([a-gA-G])(#{1,4}|b{1,4}|x{1,2}|)(\d*)$/
var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Parse a note and return its properties
 *
 * Probably you want to use `note/note` instead.
 *
 * It returns an object with the following properties:
 *
 * - __name__: {String} the parsed note string
 * - __letter__: the note letter __always__ in uppercase
 * - __pitchClass__: the note [pitch class](https://en.wikipedia.org/wiki/Pitch_class)
 * (letter in uppercase, accidentals using 'b' or '#', never 'x', no octave)
 * - __acc__: a string with the accidentals or '' if no accidentals (never null)
 * - __oct__: a integer with the octave. If not present in the note, is set to 4
 * - __alter__: the integer representic the accidentals (0 for no accidentals,
 * - __midi__: {Integer} the midi value
 * -1 for 'b', -2 for 'bb', 1 for '#', 2 for '##', etc...)
 * - __chroma__: {Integer} the pitch class interger value (between 0 and 11)
 * where C=0, C#=1, D=2...B=11
 *
 * @param {String} note - the note (pitch) to be p
 * @return an object with the note components or null if its not a valid note
 *
 * @see note/note
 *
 * @example
 * parse('C#2') // => { }
 */
function parse (note) {
  var m = REGEX.exec(note)
  if (!m) return null

  var n = { name: m[0] }
  n.letter = m[1].toUpperCase()
  n.acc = m[2].replace(/x/g, '##')
  n.pitchClass = n.letter + n.acc
  n.oct = m[3] === '' ? 4 : +m[3]
  n.alter = n.acc[0] === 'b' ? -n.acc.length : n.acc.length
  n.chroma = SEMITONES[n.letter] + n.alter
  n.midi = n.chroma + 12 * (n.oct + 1)
  return n
}

var memoize = require('../utils/fastMemoize')
var coerce = require('../utils/coerceParam')
module.exports = coerce('name', memoize(parse))

},{"../utils/coerceParam":30,"../utils/fastMemoize":31}],27:[function(require,module,exports){
var parseNote = require('../note/parse')

/**
 * Parase a scale name and returns its components
 *
 * A scale name can have two components:
 * - tonic: a note specifing the tonic
 * - type: the scale type
 *
 * @param {String} scale - the scale name (with optional tonic)
 * @return {Object} the parsed scale name
 *
 * @example
 * parse('C major') // => { tonic: 'C', type: 'major' }
 */
function parse (scale) {
  var note = null
  var type = scale.trim()
  var space = type.indexOf(' ')
  if (space > 0) {
    try {
      note = parseNote(scale.slice(0, space)).name
      type = type.substring(note.length).trim()
    } catch (e) {}
  }
  return { tonic: note, type: type }
}

module.exports = parse

},{"../note/parse":26}],28:[function(require,module,exports){
var data = require('./scales-all.json')
var dictionary = require('../list/dictionary')
var parse = require('./parse')

/**
 * A scale dictionary
 *
 * Given a scale name, returns the intervals or notes
 *
 * @param {String} name - a scale name (with or without tonic)
 * @return {Array} a list (of notes or intervals depending on the name)
 *
 * @see list/dictionary
 *
 * @example
 * scale('major') // => []
 * scale('C major') // => []
 */
module.exports = dictionary(data, parse)

},{"../list/dictionary":16,"./parse":27,"./scales-all.json":29}],29:[function(require,module,exports){
module.exports={
  "lydian": "P1 M2 M3 A4 P5 M6 M7",
  "major": "P1 M2 M3 P4 P5 M6 M7",
  "mixolydian": "P1 M2 M3 P4 P5 M6 m7",
  "dominant": "P1 M2 M3 P4 P5 M6 m7",
  "dorian": "P1 M2 m3 P4 P5 M6 m7",
  "aeolian": "P1 M2 m3 P4 P5 m6 m7",
  "minor": "P1 M2 m3 P4 P5 m6 m7",
  "phrygian": "P1 m2 m3 P4 P5 m6 m7",
  "locrian": "P1 m2 m3 P4 d5 m6 m7",
  "melodic minor": "P1 M2 m3 P4 P5 M6 M7",
  "melodic minor second mode": "P1 m2 m3 P4 P5 M6 m7",
  "lydian augmented": "P1 M2 M3 A4 A5 M6 M7",
  "lydian dominant": "P1 M2 M3 A4 P5 M6 m7",
  "melodic minor fifth mode": "P1 M2 M3 P4 P5 m6 m7",
  "locrian #2": "P1 M2 m3 P4 d5 m6 m7",
  "locrian major": "P1 M2 M3 P4 d5 m6 m7",
  "altered": "P1 m2 m3 M3 d5 m6 m7",
  "super locrian": "P1 m2 m3 M3 d5 m6 m7",
  "diminished whole tone": "P1 m2 m3 M3 d5 m6 m7",
  "major pentatonic": "P1 M2 M3 P5 M6",
  "lydian pentatonic": "P1 M3 A4 P5 M7",
  "mixolydian pentatonic": "P1 M3 P4 P5 m7",
  "locrian pentatonic": "P1 m3 P4 d5 m7",
  "minor pentatonic": "P1 m3 P4 P5 m7",
  "minor six pentatonic": "P1 m3 P4 P5 M6",
  "minor hexatonic": "P1 M2 m3 P4 P5 M7",
  "flat three pentatonic": "P1 M2 m3 P5 M6",
  "flat six pentatonic": "P1 M2 M3 P5 m6",
  "major flat two pentatonic": "P1 m2 M3 P5 M6",
  "whole tone pentatonic": "P1 M3 d5 m6 m7",
  "ionian pentatonic": "P1 M3 P4 P5 M7",
  "lydian #5 pentatonic": "P1 M3 A4 A5 M7",
  "lydian dominant pentatonic": "P1 M3 A4 P5 m7",
  "minor #7 pentatonic": "P1 m3 P4 P5 M7",
  "super locrian pentatonic": "P1 m3 d4 d5 m7",
  "in-sen": "P1 m2 P4 P5 m7",
  "iwato": "P1 m2 P4 d5 m7",
  "hirajoshi": "P1 M2 m3 P5 m6",
  "kumoijoshi": "P1 m2 P4 P5 m6",
  "pelog": "P1 m2 m3 P5 m6",
  "vietnamese 1": "P1 m3 P4 P5 m6",
  "vietnamese 2": "P1 m3 P4 P5 m7",
  "prometheus": "P1 M2 M3 A4 M6 m7",
  "prometheus neopolitan": "P1 m2 M3 A4 M6 m7",
  "ritusen": "P1 M2 P4 P5 M6",
  "scriabin": "P1 m2 M3 P5 M6",
  "piongio": "P1 M2 P4 P5 M6 m7",
  "major blues": "P1 M2 m3 M3 P5 M6",
  "minor blues": "P1 m3 P4 d5 P5 m7",
  "composite blues": "P1 M2 m3 M3 P4 d5 P5 M6 m7",
  "augmented": "P1 A2 M3 P5 A5 M7",
  "augmented heptatonic": "P1 A2 M3 P4 P5 A5 M7",
  "dorian #4": "P1 M2 m3 A4 P5 M6 m7",
  "lydian diminished": "P1 M2 m3 A4 P5 M6 M7",
  "whole tone": "P1 M2 M3 A4 A5 m7",
  "leading whole tone": "P1 M2 M3 A4 A5 m7 M7",
  "harmonic minor": "P1 M2 m3 P4 P5 m6 M7",
  "lydian minor": "P1 M2 M3 A4 P5 m6 m7",
  "neopolitan": "P1 m2 m3 P4 P5 m6 M7",
  "neopolitan minor": "P1 m2 m3 P4 P5 m6 m7",
  "neopolitan major": "P1 m2 m3 P4 P5 M6 M7",
  "neopolitan major pentatonic": "P1 M3 P4 d5 m7",
  "romanian minor": "P1 M2 m3 d5 P5 M6 m7",
  "double harmonic lydian": "P1 m2 M3 A4 P5 m6 M7",
  "diminished": "P1 M2 m3 P4 d5 m6 M6 M7",
  "harmonic major": "P1 M2 M3 P4 P5 m6 M7",
  "double harmonic major": "P1 m2 M3 P4 P5 m6 M7",
  "egyptian": "P1 M2 P4 P5 m7",
  "hungarian minor": "P1 M2 m3 A4 P5 m6 M7",
  "hungarian major": "P1 A2 M3 A4 P5 M6 m7",
  "oriental": "P1 m2 M3 P4 d5 M6 m7",
  "spanish": "P1 m2 M3 P4 P5 m6 m7",
  "spanish heptatonic": "P1 m2 m3 M3 P4 P5 m6 m7",
  "flamenco": "P1 m2 m3 M3 A4 P5 m7",
  "balinese": "P1 m2 m3 P4 P5 m6 M7",
  "todi raga": "P1 m2 m3 A4 P5 m6 M7",
  "malkos raga": "P1 m3 P4 m6 m7",
  "kafi raga": "P1 m3 M3 P4 P5 M6 m7 M7",
  "purvi raga": "P1 m2 M3 P4 A4 P5 m6 M7",
  "persian": "P1 m2 M3 P4 d5 m6 M7",
  "bebop": "P1 M2 M3 P4 P5 M6 m7 M7",
  "bebop dominant": "P1 M2 M3 P4 P5 M6 m7 M7",
  "bebop minor": "P1 M2 m3 M3 P4 P5 M6 m7",
  "bebop major": "P1 M2 M3 P4 P5 A5 M6 M7",
  "bebop locrian": "P1 m2 m3 P4 d5 P5 m6 m7",
  "minor bebop": "P1 M2 m3 P4 P5 m6 m7 M7",
  "mystery #1": "P1 m2 M3 d5 m6 m7",
  "enigmatic": "P1 m2 M3 d5 m6 m7 M7",
  "minor six diminished": "P1 M2 m3 P4 P5 m6 M6 M7",
  "ionian augmented": "P1 M2 M3 P4 A5 M6 M7",
  "lydian #9": "P1 m2 M3 A4 P5 M6 M7",
  "ichikosucho": "P1 M2 M3 P4 d5 P5 M6 M7",
  "six tone symmetric": "P1 m2 M3 P4 A5 M6",
  "arabian": "P1 M2 M3 P4 d5 m6 m7",
  "ionian": "P1 M2 M3 P4 P5 M6 M7",
  "pomeroy": "P1 m2 m3 M3 d5 m6 m7",
  "pentatonic": "P1 M2 M3 P5 M6",
  "minor seven flat five pentatonic": "P1 m3 P4 d5 m7",
  "chinese": "P1 M3 A4 P5 M7",
  "kumoi": "P1 M2 m3 P5 M6",
  "blues": "P1 m3 P4 d5 P5 m7",
  "gypsy": "P1 m2 M3 P4 P5 m6 M7",
  "hindu": "P1 M2 M3 P4 P5 m6 m7",
  "indian": "P1 M3 P4 P5 m7",
  "dorian b2": "P1 m2 m3 P4 P5 M6 M7",
  "lydian b7": "P1 M2 M3 A4 P5 M6 m7",
  "mixolydian b6": "P1 M2 M3 P4 P5 m6 m7",
  "phrygian major": "P1 m2 M3 P4 P5 m6 m7"
}

},{}],30:[function(require,module,exports){
/**
 * Internal function: ensures the param is a string
 *
 * It allows parse to be called on itself:
 * `parse(parse(parse('C3')))`
 *
 * @api private
 */
function coerce (name, func) {
  return function (param) {
    if (!param) return null
    else if (param[name]) return func(param[name])
    else if (typeof param === 'string') return func(param)
    else throw Error('The ' + name + ' must be a string: ' + param)
  }
}

module.exports = coerce

},{}],31:[function(require,module,exports){
/**
 * Simplest and fastest memoize function I can imagine
 *
 * This is in base of two restrictive asumptions:
 * - the function only receives __one paramater__
 * - the parameter __is a string__
 *
 * For a more complete memoize solution see:
 * https://github.com/addyosmani/memoize.js
 *
 * @api private
 * @param {Function} func - the function to memoize
 * @return {Function} A memoized function
 */
function memoize (func) {
  var cache = {}
  return function (str) {
    return (str in cache) ? cache[str] : cache[str] = func(str)
  }
}
module.exports = memoize

},{}],32:[function(require,module,exports){
/**
 * Decorate a function to throw exception when return null
 *
 * @example
 * var parse = require('tonal/note/parse')
 * var strictParse = strict('Not a valid note', parse)
 * strictParse('P8') // throws Error with msg 'Not a valid note'
 */
function strict (msg, func) {
  return function () {
    var r = func.apply(this, arguments)
    if (r === null) throw Error(msg + ': ' + arguments[0])
    return r
  }
}

module.exports = strict

},{}]},{},[2]);
