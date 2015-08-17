(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var riot = require('riot')
var scales = require('./scales.tag')
require('./vexflow.tag')
riot.mount(scales)

},{"./scales.tag":2,"./vexflow.tag":4,"riot":5}],2:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('scales', '<div> <h1>Scales demo { version }</h1> <select id="tonicSelect" onchange="{ tonicChanged }"> <option each="{ tonic in tonics }" value="{tonic}">{tonic}</option> </select> <select id="scaleType" onchange="{ scaleChanged }"> <option each="{ name in names }" value="{name}">{name}</option> </select> <h3>{tonic} {name}</h3> <h5>Notes: { notes.join(\' \') }</h5> <vexflow notes="{ notes }"></vexflow> </div>', function(opts) {

  var riot = require('riot')
  var scale = require('tonal/scale/scale')
  var names = require('tonal/scale/scale-names')
  this.tonics = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ')
  this.names = names()
  this.name = this.names[0]
  this.tonic = 'C'
  this.notes = scale(this.tonic + ' ' + this.name )

  this.scaleChanged = function(e) {
    this.name = scaleType.value
    this.notes = scale(this.tonic + ' ' + scaleType.value)
  }.bind(this);

  this.tonicChanged = function(e) {
    this.tonic = tonicSelect.value
    this.notes = scale(this.tonic + ' ' + scaleType.value)
  }.bind(this);

});

},{"riot":5,"tonal/scale/scale":38,"tonal/scale/scale-names":37}],3:[function(require,module,exports){
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
    var staveNote = new VexFlow.StaveNote({ keys: [note.step + note.acc + '/' + note.oct], duration: 'q' })
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

},{"tonal/note/parse":32}],4:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('vexflow', '<div> <canvas id="vex" width="800" height="100"></canvas> </div>', function(opts) {
    var vexflow = require('./vexflow.js')
    this.on('update', function() {
      vexflow(this.vex, 800, 100, this.opts.notes)
    })
  
});

},{"./vexflow.js":3,"riot":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){

/**
 * Given a data hash, return the keys
 *
 * @param {Hash} hash - the data hash
 * @return the hash keys as array
 */
function names (data) {
  var keys = null
  return function () {
    if (!keys) keys = Object.keys(data)
    return keys
  }
}

module.exports = names

},{}],7:[function(require,module,exports){
var set = require('../set/set')

/**
 * Create a set generator from a hash map data and a name parser
 *
 * A set generator is a function that generates sets from strings. It uses
 * a parser to separate the tonic (if any) from the real name. Then look up
 * into the hash for a name and pass it to a set generator.
 *
 * If the name is not found in the hash data, it throws an exception
 *
 * The scale/scale and chord/chord functions uses this to create a generator.
 *
 * @param {Hash} data - the data hash (dictionary)
 * @param {Function} parser - a function that parses the name and returns
 * an object with tonic (if not present) and the name properties
 *
 * @example
 * var setGenerator = require('tonal/data/set-generator')
 * var scale = setGenerator({'major': 2773})
 * scale('C major') // => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
 * scale('major') // => ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']
 */
function setGenerator (data, parser) {
  parser = parser || parseName
  return function (name) {
    var parsed = parser(name)
    var setIdentifier = data[parsed.type]
    if (!setIdentifier) throw Error('Name not found: ' + parsed.type)
    return set(setIdentifier, parsed.tonic)
  }
}

module.exports = setGenerator

var REGEX = /^([a-gA-G])?\s*(.*)$/
function parseName (name) {
  var m = REGEX.exec(name)
  return m ? { tonic: m[1], type: m[2] } : m
}

},{"../set/set":46}],8:[function(require,module,exports){
var parse = require('./parse')

/**
 * Get the interval direction (1 ascending, -1 descending)
 *
 * @param {String} interval - the interval
 * @return {Integer} the direction (1: ascending interval, -1: descending interval)
 *
 * @module interval
 * @example
 * direction('P5') // => 1
 * direction('P-4') // => -1
 */
function direction (interval) {
  return parse(interval).d
}
module.exports = direction

},{"./parse":18}],9:[function(require,module,exports){
var pc = require('../note/pitch-class')

/**
 * Get the distance in semitones between two notes
 *
 * @param {String} root - the root note
 * @param {String} destination - the destination note
 *
 * @module interval
 *
 * @example
 * distanceChromatic('C', 'G') // => 7
 * distanceChromatic('G', 'C') // => -7
 */
function distanceChromatic (root, dest) {
  return pc(dest) - pc(root)
}
module.exports = distanceChromatic

},{"../note/pitch-class":33}],10:[function(require,module,exports){
var step = require('../note/step')

var STEPS = {'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6}

/**
 * Get the generic interval distance between two notes
 *
 * @module interval
 *
 * @example
 * distanceGeneric('C', 'G') // => 4
 * distanceGeneric('G', 'C') // => -4
 */
function distanceGeneric (root, dest) {
  return STEPS[step(dest)] - STEPS[step(root)]
}
module.exports = distanceGeneric

},{"../note/step":34}],11:[function(require,module,exports){
var distanceGeneric = require('./distance-generic')
var distanceChromatic = require('./distance-chromatic')
var genericToDiatonic = require('./generic-to-diatonic')

/**
 * Get the interval between two notes
 *
 * @param {String} root - root or tonic note
 * @param {String} destination - the destination note
 * @return {String} an interval
 */
function distanceInterval (root, dest) {
  return genericToDiatonic(distanceGeneric(root, dest), distanceChromatic(root, dest))
}

module.exports = distanceInterval

},{"./distance-chromatic":9,"./distance-generic":10,"./generic-to-diatonic":12}],12:[function(require,module,exports){
var type = require('./generic-type')

var DIMISHED = { 1: -1, 2: 0, 3: 2, 4: 4, 5: 6, 6: 7, 7: 9, 8: 11 }

/**
 * Given a generic interval and a number of semitones, return the interval
 * (if exists)
 */
function genericToDiationic (generic, semitones) {
  var qualities = type(generic) === 'perfect' ? ['d', 'P', 'A'] : ['d', 'm', 'M', 'A']
  var dir = semitones < 0 ? '-' : ''
  var num = generic + 1
  var quality = qualities[semitones - DIMISHED[num]]
  return quality ? quality + dir + num : null
}
module.exports = genericToDiationic

},{"./generic-type":13}],13:[function(require,module,exports){
/**
 * Return the type ('perfect' or 'major') of the [generic interval](https://en.wikipedia.org/wiki/Generic_interval)
 *
 * A generic interval its the number of a diatonic interval
 *
 * @param {Integer} number - the generic interval (positive integer)
 * @return {String} the type ('perfect' or 'major')
 *
 * @example
 * genericType(0) // 'perfect'  <- unison
 * genericType(3) // 'perfect'  <- fourth
 * genericType(4) // 'perfect'  <- fifth
 * genericType(7) // 'perfect'  <- octave
 * genericType(8) // 'major'    <- nineth
 */
function genericType (generic) {
  var n = Math.abs(generic) % 7
  if (n === 0 || n === 3 || n === 4) return 'perfect'
  else return 'major'
}

module.exports = genericType

},{}],14:[function(require,module,exports){
var number = require('./number')
var numberToGeneric = require('./number-to-generic')
/**
 * Convert a [diatonic interval](https://en.wikipedia.org/wiki/Interval_(music))
 * into a [generic interval](https://en.wikipedia.org/wiki/Generic_interval)
 *
 * @param {String} interval - the diatonic interval
 * @return {Integer} the generic interval
 *
 * @see genericToDiatonic
 * @module interval
 *
 * @example
 * generic('M9') // => 1
 */
function generic (interval) {
  return numberToGeneric(number(interval))
}

module.exports = generic

},{"./number":17,"./number-to-generic":16}],15:[function(require,module,exports){
var INTERVAL = /^[AdmMP]-?\d+$/

function isInterval (interval) {
  return INTERVAL.test(interval)
}

module.exports = isInterval

},{}],16:[function(require,module,exports){

/**
 * Give a interval number, returns a [generic interval](https://en.wikipedia.org/wiki/Generic_interval)
 *
 * @param {Integer} number - the interval number
 * @return {Integer} the generic interval (an integer bewteen 0 and 6)
 */
function numberToGeneric (num) {
  if (num === 0) throw Error('0 is not a valid interval number')
  var dir = num > 0 ? 1 : -1
  return dir * (Math.abs(num) - 1) % 7
}
module.exports = numberToGeneric

},{}],17:[function(require,module,exports){
var parse = require('./parse')

/**
 * Return the number (diatonic number or generic interval) of an interval
 */
function number (interval) {
  return parse(interval).n
}
module.exports = number

},{"./parse":18}],18:[function(require,module,exports){
var REGEX = /^([AdmMP])(-?)(\d+)$/

/**
 * Get the interval components
 *
 * This method retuns an object with the following properties:
 * - q: the quality (one of `dmPMA` for dimished, minor, perfect, major and
 * augmented respectively)
 * - d: direction, 1 for ascending intervals, -1 for descending ones
 * - n: diatonic number (a positive integer bigger that 0)
 *
 * @param {String} name - the name of the interval to be parsed
 * @return {Array} an array in the form [quality, direction, number]
 *
 * @example
 * var parse = require('tonal/interval/parse')
 * parse('P-5') // => {q: 'P', d: -1, n: 5}
 * parse('M9') // => {q: 'M', d: 1, n: 9}
 */
function parse (interval) {
  var m = REGEX.exec(interval)
  if (!m) throw Error('Not an interval: ' + interval)
  return { q: m[1], d: m[2] === '' ? 1 : -1, n: +m[3] }
}

module.exports = parse

},{}],19:[function(require,module,exports){
var simple = require('./simple')
var direction = require('./direction')

// size in semitones to cannonical (perfect or major) generic intervals
var SIZES = { 1: 0, 2: 2, 3: 4, 5: 7, 6: 9, 7: 11, 8: 12 }
var DIMISHED = { 1: -1, 2: 0, 3: 2, 4: 4, 5: 6, 6: 7, 7: 9, 8: 11 }
var NAME_TO_DISTANCE = { 'd1': -1, 'P1': 0, 'A1': 1, 'd2': 0, 'm2': 1, 'M2': 2,
  'A2': 3, 'd3': 2, 'm3': 3, 'M3': 4, 'A3': 5, 'd4': 4, 'P4': 5, 'A4': 6,
  'd5': 6, 'P5': 7, 'A5': 8, 'd6': 7, 'm6': 8, 'M6': 9, 'A6': 10, 'd7': 9,
  'm7': 10, 'M7': 11, 'A7': 12, 'd8': 11, 'P8': 12, 'A8': 13 }

/**
 * Get the semitones distance of an intervals
 *
 * @param {String} interval - the interval
 * @return {Integer} the number of semitones
 *
 * @module interval
 * @example
 * semitones('P5') // => 7
 */
function semitones (interval) {
  return direction(interval) * NAME_TO_DISTANCE[simple(interval, true)]
}
module.exports = semitones

},{"./direction":8,"./simple":20}],20:[function(require,module,exports){
var parse = require('./parse')
var numberToGeneric = require('./number-to-generic')

/**
 * Simplify an interval
 *
 * @param {String} interval - the interval to be simplified
 * @param {boolean} ascending - (optional) if true, the simplified interval will
 * be always ascending
 *
 * @module interval
 *
 * @example
 * simple('M9') // => 'M2'
 * simple('M-9') // => 'M-2'
 * simple('M-9', true) // => 'M2'
 */
function simple (interval, ascending) {
  var i = parse(interval)
  var num = i.n === 8 ? 8 : numberToGeneric(i.n) + 1
  var dir = (ascending || i.d === 1) ? '' : '-'
  return i.q + dir + num
}

module.exports = simple

},{"./number-to-generic":16,"./parse":18}],21:[function(require,module,exports){

var midi = require('../note/midi')
var fromMidi = require('../note/from-midi')

function transposeChromatic (semitones, note) {
  return fromMidi(midi(note) + semitones)
}
module.exports = transposeChromatic

},{"../note/from-midi":28,"../note/midi":30}],22:[function(require,module,exports){
var step = require('../note/step')
var CLASSES = 'CDEFGABCDEFGAB'

/**
 * Transpose note a generic interval
 *
 * A generic interval is defined is the number part of a diationc interval
 * (2: ascendent second, 3: ascendent thirth, -4: descending fourth, ...)
 * The generic interval do not take account of diatonic spelling
 *
 * @param {Integer} generic - the generic interval
 * @param {String} note - the note (everything but the step is ignored)
 * @return {String} the tranposed step (in uppercase)
 *
 * @example
 * transpose(0, 'C') // => 'C'
 * transpose(1, 'C') // => 'D'
 * transpose(-1, 'C') // => 'B'
 */
function transposeGeneric (number, note) {
  var index = CLASSES.indexOf(step(note))
  var dest = index + (number % 7)
  if (dest < 0) dest += 7
  return CLASSES[dest]
}
module.exports = transposeGeneric

},{"../note/step":34}],23:[function(require,module,exports){
var transposeGeneric = require('./transpose-generic')
var transposeChromatic = require('./transpose-chromatic')
var generic = require('./generic')
var semitones = require('./semitones')
var enharmonic = require('../note/enharmonic')

function transposeDiatonic (interval, note) {
  var steps = transposeGeneric(generic(interval), note)
  var chromatic = transposeChromatic(semitones(interval), note)
  return enharmonic(chromatic, steps)
}
module.exports = transposeDiatonic

},{"../note/enharmonic":27,"./generic":14,"./semitones":19,"./transpose-chromatic":21,"./transpose-generic":22}],24:[function(require,module,exports){
/**
 * Given a number of accidentals returns the string representation
 *
 * @param {Integer} number - the number of accidentals (posivite for shaprs,
 * negative for flats, zero for an empty string)
 * @return {String} an accidentals string
 *
 * @example
 * var accidentals = require('tonal/misc/accidentals')
 * accidenals(2) // => '##'
 * accidenals(-2) // => 'bb'
 * accidenals(0) // => ''
 */
function accidentals (value) {
  value = +value
  if (value > 0) return Array(value + 1).join('#')
  else if (value < 0) return Array(Math.abs(value) + 1).join('b')
  else return ''
}

module.exports = accidentals

},{}],25:[function(require,module,exports){
var accidentals = require('./accidentals')

/**
 * TODO: write proper docs
 * @example
 * alteration('C#6') // 1
 * alteration('Db') // -1
 * alteration('E') // 0
 * alteration('#') // => 1
 * alteration('##') // => 2
 * alteration('b') // => -1
 * alteration('bb') // => -2
 * alteration('') // 0
 */
function alteration (value) {
  if (/^#+$/.test(value)) return value.length
  else if (/^b*$/.test(value)) return -1 * value.length
  else return alteration(accidentals(value))
}
module.exports = alteration

},{"./accidentals":24}],26:[function(require,module,exports){
var alter = require('../misc/alteration')
var parse = require('./parse')

/**
 * Return the alteration number of the note
 *
 * @param {String} note - the note
 * @return {Integer} the alteration number
 *
 * @see misc/alteration
 * @module note
 *
 * @example
 * alteration('C#6') // 1
 * alteration('Db') // -1
 * alteration('E') // 0
 * alteration('bb') // => -1 (first char is the step)
 */
function alteration (note) {
  return alter(parse(note).acc)
}
module.exports = alteration

},{"../misc/alteration":25,"./parse":32}],27:[function(require,module,exports){
var pc = require('./pitch-class')
var octave = require('./octave')
var accidentals = require('../misc/accidentals')

/**
 * Get the enharmonic of a note with a given step
 *
 * @example
 * enharmonic('C#4', 'D') // => 'Db4'
 * enharmonic('B#', 'C') // => 'C'
 */
function enharmonic (note, step) {
  var oct = octave(note)
  var dist = pc(note) - pc(step)
  if (dist > 6) {
    dist = dist - 12
    oct++
  } else if (dist < -6) {
    dist = dist + 12
    oct--
  }
  return step + accidentals(dist) + oct
}

module.exports = enharmonic

},{"../misc/accidentals":24,"./octave":31,"./pitch-class":33}],28:[function(require,module,exports){
'use strict'

var CHROMATIC = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B' ]

/**
 * Get the note of the given midi number
 *
 * This method doesn't take into account diatonic spelling. Always the same
 * pitch class is given to the same midi number. @see enahrmonic
 *
 * @param {Integer} midi - the midi number
 * @return {String} the note or null if there's no pitchClass available to this note name
 *
 */
function fromMidi (midi) {
  var name = CHROMATIC[midi % 12]
  var oct = Math.floor(midi / 12) - 1
  return name + oct
}

module.exports = fromMidi

},{}],29:[function(require,module,exports){
var NOTE = /^([a-gA-G])(#{0,2}|b{0,2})(-?[0-9]{0,1})$/

/**
 * Determine if the given string is a valid note
 *
 * @param {String} string - the string to be tested
 * @return {Boolean} true if is a valid note
 */
function isNote (string) {
  return NOTE.test(string)
}

module.exports = isNote

},{}],30:[function(require,module,exports){
var pitchClass = require('./pitch-class')
var octave = require('./octave')

/**
 * Get the midi number of the given note
 *
 * @param {String} note - the note
 * @return {Integer} - the midi number
 *
 * @example
 * var midi = require('tonal/note/midi')
 * midi('A4') // => 69
 */
function midi (note) {
  return pitchClass(note) + 12 * (octave(note) + 1)
}

module.exports = midi

},{"./octave":31,"./pitch-class":33}],31:[function(require,module,exports){

var parse = require('./parse')

function octave (note) {
  return parse(note).oct
}
module.exports = octave

},{"./parse":32}],32:[function(require,module,exports){

var STEP = '([a-gA-G])'
var ACC = '(#{1,4}|b{1,4}|x{1,2}|)'
var OCT = '(-?[0-9]{0,1})'
var NOTE = new RegExp('^' + STEP + ACC + OCT + '$')
var NAME_PREFIX = new RegExp('^' + STEP + ACC + '()')

/**
 * Get the components of a note (step, accidentals and octave)
 *
 * It returns an object with the following properties:
 * - step: the step letter __always__ in uppercase
 * - acc: a string with the accidentals or '' if no accidentals (never null)
 * - oct: a integer with the octave. If not present in the note, is set to 4
 *
 * @param {String} note - the note (pitch) to be parsed
 * @param {boolean} namePrefix - if name prefix is true, then a note name
 * (without octave) is extracted from the beggining of the string
 * @return an object with the note components
 */
function parse (note, namePrefix) {
  var m = (namePrefix ? NAME_PREFIX : NOTE).exec(note)
  if (!m) throw Error('Invalid note: ' + note)
  return { note: m[0], step: m[1].toUpperCase(),
    acc: m[2].replace(/x/g, '##'), oct: m[3] ? +m[3] : 4 }
}

module.exports = parse

},{}],33:[function(require,module,exports){

var step = require('./step')
var alteration = require('./alteration')

var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Get the [pitch class](https://en.wikipedia.org/wiki/Pitch_class#Integer_notation)
 * of the note
 *
 * The pitch class is an integer value of the pitch where C=0, C#=1, D=2...B=11
 *
 * @example
 * pitchClass('C2') // => 0
 * pitchClass('C3') // => 0
 * pitchClass('C#') // => 1
 * pitchClass('Db') // => 1
 */
function pitchClass (note) {
  return SEMITONES[step(note)] + alteration(note)
}
module.exports = pitchClass

},{"./alteration":26,"./step":34}],34:[function(require,module,exports){

var parse = require('./parse')

/**
 * Get the step of a note (the letter in uppercase, ignoring the accidentals and octave)
 *
 * @param {String} note - the note to get the step of
 * @return {String} the step letter (__always in uppercase__)
 *
 * @example
 * step('C#4') // => 'C'
 * step('db7') // => 'D'
 */
function step (note) {
  return parse(note).step
}
module.exports = step

},{"./parse":32}],35:[function(require,module,exports){

/**
 * Transpose a note by an (diatonic) interval
 *
 * @see interval/transpose-diationic
 * @example
 * transpose('P5', 'D') // => 'A4'
 */
module.exports = require('../interval/transpose-interval')

},{"../interval/transpose-interval":23}],36:[function(require,module,exports){
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
      note = parseNote(scale.slice(0, space)).note
      type = type.substring(note.length).trim()
    } catch (e) {}
  }
  return { tonic: note, type: type }
}

module.exports = parse

},{"../note/parse":32}],37:[function(require,module,exports){
var data = require('./scales-all.json')
var names = require('../data/names')
/**
 * Get all scale names
 */
module.exports = names(data)

},{"../data/names":6,"./scales-all.json":39}],38:[function(require,module,exports){
var data = require('./scales-all.json')
var generator = require('../data/set-generator')
var parse = require('./parse')

/**
 * A scale set generator
 *
 * Given a scale name returns the intervals or notes
 *
 * @param {String} name - a scale name (with or without tonic)
 * @return {Array} a set (of notes or intervals depending on the name)
 *
 * @see set/generator
 *
 * @example
 * scale('major') // => []
 * scale('C major') // => []
 */
module.exports = generator(data, parse)

},{"../data/set-generator":7,"./parse":36,"./scales-all.json":39}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
var parse = require('../interval/parse')
var set = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7']

/**
 * Returns a set of intervals that represents an harmonic chromatic scale
 *
 * The harmonic chromatic scale is the same whether rising or falling and
 * includes all the notes in the major, harmonic minor or melodic minor
 * scales plus flattened second and sharpened fourth degrees
 */
function chromaticIntervalSet (length) {
  if (length > set.length) set = upToOctave(set, length % 12)
  return set.slice(0, length)
}

module.exports = chromaticIntervalSet

function upToOctave (source, octave) {
  var interval, num
  var result = source.slice(0, 12)
  for (var oct = 1; oct <= octave; oct++) {
    num = oct * 8 - 1
    for (var i = 0; i < 12; i++) {
      interval = parse(source[i])
      result.push(interval.q + (interval.n + num))
    }
  }
  return result
}

},{"../interval/parse":18}],41:[function(require,module,exports){
var isBinary = require('./is-binary-set')
var isIntervals = require('./is-interval-set')
var isNotes = require('./is-note-set')
var distance = require('../interval/distance-interval')
var chromatic = require('./chromatic-interval-set')

/**
 * Given a set identifier return the intervals
 *
 * @param {String|Decimal|Array} set - the set to get the intervals from
 * @return {Array} an array of intervals
 */
function intervalSet (set) {
  if (isBinary(set)) {
    return binaryIntervals(set.toString(2))
  }

  if (typeof (set) === 'string') set = set.split(' ')
  if (isIntervals(set)) {
    return set
  } else if (isNotes(set)) {
    var root = set[0]
    return set.map(function (note) {
      return distance(root, note)
    })
  }
}

module.exports = intervalSet

function binaryIntervals (binary) {
  var chroma = chromatic(binary.length)
  var result = []
  for (var i = 0, len = binary.length; i < len; i++) {
    if (binary[i] === '1') result.push(chroma[i])
  }
  return result
}

},{"../interval/distance-interval":11,"./chromatic-interval-set":40,"./is-binary-set":42,"./is-interval-set":43,"./is-note-set":44}],42:[function(require,module,exports){
'use strict'

var BINARY = /^1[01]*$/

/**
 * Determine if a given number is a valid binary set number
 *
 * A valid binary set is any binary number that starts with 1 (P1 interval)
 * The binary number can be expressed in decimal
 *
 * @param {String} number - the number to test
 * @return {boolean} true if its a valid scale binary number
 *
 * @example
 * isBinary('100') // => true
 * isBinarySet('010') // => false
 * isBinarySet(2773) // => true
 */
function isBinarySet (number) {
  return BINARY.test(number.toString(2))
}

module.exports = isBinarySet

},{}],43:[function(require,module,exports){
var isInterval = require('../interval/is-interval')

/**
 * Test is the given set is an interval set
 *
 * An interval set is an array where all items are inteval strings and
 * the first item is 'P1'
 *
 * @param {Object} set - the set to be tested
 * @return {Boolean} true if is an interval set
 *
 * @example
 * isIntervalSet(['P1']) // => true
 */
function isIntervalSet (set) {
  if (!Array.isArray(set)) return false
  if (set[0] !== 'P1') return false
  for (var i = 0, total = set.length; i < total; i++) {
    if (!isInterval(set[i])) return false
  }
  return true
}

module.exports = isIntervalSet

},{"../interval/is-interval":15}],44:[function(require,module,exports){
var isNote = require('../note/is-note')

/**
 * Test if the given set is a valid note set
 *
 * A valid note set is an array of note strings
 *
 * @param {Object} set - the set to be tested
 * @return {Boolean} true if is a note set
 */
function isNoteSet (set) {
  if (!Array.isArray(set)) return false
  for (var i = 0, total = set.length; i < total; i++) {
    if (!isNote(set[i])) return false
  }
  return true
}

module.exports = isNoteSet

},{"../note/is-note":29}],45:[function(require,module,exports){
var isNotes = require('./is-note-set')
var intervals = require('./interval-set')
var transpose = require('../note/transpose')

/**
 * Given a set and a note, return a set with the same intervals but starting from note
 *
 * @param {Array|String|Integer} set - the original set. Can be a notes or
 * intervals array, a binary string set or a decimal set
 */
function noteSet (set, root) {
  if (isNotes(set) && set[0] === root) return set
  return intervals(set).map(function (interval) {
    return transpose(interval, root)
  })
}

module.exports = noteSet

},{"../note/transpose":35,"./interval-set":41,"./is-note-set":44}],46:[function(require,module,exports){
var intervals = require('./interval-set')
var notes = require('./note-set')
/**
 * Create a set (either a group of intervals or notes depending if you provide
 * a tonic parameter or not)
 *
 * It uses `set/intervals` or `set/notes` depending
 * on the action. Is a convenience function when creating scales or chords
 *
 * @see scale/scale
 * @see chord/chord
 *
 * @param {String} note - the tonic note (can be null)
 * @param {String|Integer|Array} identifier - the set identifier
 * @return {Array} an array of notes or intervals
 */
function set (set, note) {
  if (!note || /^\s*$/.test(note)) {
    return intervals(set)
  } else {
    return notes(set, note)
  }
}

module.exports = set

},{"./interval-set":41,"./note-set":45}]},{},[1]);
