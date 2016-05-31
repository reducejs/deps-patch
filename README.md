# deps-patch
[![version](https://img.shields.io/npm/v/deps-patch.svg)](https://www.npmjs.org/package/deps-patch)
[![status](https://travis-ci.org/reducejs/deps-patch.svg)](https://travis-ci.org/reducejs/deps-patch)

A plugin for both [browserify] and [depsify],
to allow to add dependencies not detected from code.

## Example
In the following example,
`entry.css` depends upon `entry-deps.css`,
and `extra.css` upon `extra-deps.css`.

We can make `entry.css` depends on `extra.css` using this plugin.

```js
var reduce = require('reduce-css')
var path = require('path')

var b = reduce.create(
  'entry.css',
  { basedir: path.join(__dirname, 'src') },
  'bundle.css'
)
b.plugin('deps-patch')
b.bundle().pipe(b.dest(path.join(__dirname, 'build')))

// add dependencies
setTimeout(function () {
  b.emit('deps-patch.update', [
    // it claims that entry.css should depend on extra.css
    // even if entry.css does not do it in the code
    { file: 'entry.css', deps: ['extra.css'] },
  ])
}, 200)

```

The result would be something like:

```css
.entry-deps{} /* from entry-deps.css */
.extra-deps{} /* from extra-deps.css */
.extra{} /* from extra.css */
.entry{} /* from entry.css */

```

## Usage
The `deps-patch.update` event should be fired whenever you want to add new dependencies.

```js
b.plugin('deps-patch')

b.emit('deps-patch.update', depsPatch)

```

`depsPatch` is an array of rows.
A `row` is just an object with fields:

* `file`: `String`. the file path to the dependent
* `deps`: `Array`. an array of file path to modules the dependent should depend upon.

[browserify]: https://github.com/substack/node-browserify
[depsify]: https://github.com/reducejs/depsify

