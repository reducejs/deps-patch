var test = require('tap').test
var depsPatch = require('..')
var reduce = require('reduce-css')
var path = require('path')
var del = require('del')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures', 'add-deps')
var fs = require('fs')

test('add deps', function (t) {
  var b = reduce.create(
    'entry.css',
    { basedir: fixtures('src') },
    'bundle.css'
  )
  b.plugin(depsPatch)
  del.sync(fixtures('build'))
  b.bundle().pipe(b.dest(fixtures('build'))).on('end', function () {
    t.equal(
      fs.readFileSync(fixtures('build', 'bundle.css'), 'utf8'),
      fs.readFileSync(fixtures('expected', 'bundle.css'), 'utf8')
    )
    t.end()
  })
  setTimeout(function () {
    b.emit('deps-patch.update', [
      // null.css is not @imported in the code
      // but entry-deps.css does
      { file: 'entry.css', deps: ['null.css', 'entry-deps.css'] },
      { file: 'null.css', deps: ['extra.css'] },
    ])
  }, 200)
})

