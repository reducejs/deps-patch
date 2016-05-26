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
b.plugin('deps-patch', function () {
  this.push({ file: 'entry.css', deps: ['extra.css'] })
})
b.bundle().pipe(b.dest(path.join(__dirname, 'build')))

```

The result would be something like:

```css
.entry-deps{} /* from entry-deps.css */
.extra-deps{} /* from extra-deps.css */
.extra{} /* from extra.css */
.entry{} /* from entry.css */

```

## Options
The `options` object passed to the plugin should be a function,
which is called as a method of an array,
and new dependencies could be added by pushing rows into it.

```js
function () {
  this.push(row)
}

```

A promise may be returned for async operations.

If the returned value resolves to an array,
each element will be treated as a row.

A `row` is just an object with fields:

* `file`: `String`. the file path to the dependent
* `deps`: `Array`. an array of file path to modules the dependent should depend upon.

[browserify]: https://github.com/substack/node-browserify
[depsify]: https://github.com/reducejs/depsify

