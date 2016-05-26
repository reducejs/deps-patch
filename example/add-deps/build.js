var reduce = require('reduce-css')
var path = require('path')
var del = require('del')

var b = reduce.create(
  'entry.css',
  { basedir: path.join(__dirname, 'src') },
  'bundle.css'
)
b.plugin('deps-patch', function () {
  this.push({ file: 'entry.css', deps: ['null.css'] })
  this.push({ file: 'null.css', deps: ['extra.css'] })
})
del.sync(__dirname + '/build')
b.bundle().pipe(b.dest(path.join(__dirname, 'build')))
