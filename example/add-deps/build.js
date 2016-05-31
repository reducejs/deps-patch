var reduce = require('reduce-css')
var path = require('path')
var del = require('del')

var b = reduce.create(
  'entry.css',
  {
    basedir: path.join(__dirname, 'src'),
    cache: {},
    packageCache: {},
  },
  'bundle.css',
  null
)
b.plugin('deps-patch')

del.sync(__dirname + '/build')

b.on('common.map', function (o) {
  console.log(JSON.stringify(o, null, 2))
})
b.on('update', function update() {
  b.bundle().pipe(b.dest(path.join(__dirname, 'build')))
  return update
}())

setTimeout(function () {
  b.emit('deps-patch.update', [
    { file: 'entry.css', deps: ['null.css'] },
    { file: 'null.css', deps: ['extra.css'] },
  ])
}, 1000)
