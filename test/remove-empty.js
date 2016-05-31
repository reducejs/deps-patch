var test = require('tap').test
var depsPatch = require('..')
var reduce = require('reduce-css')
var path = require('path')
var del = require('del')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures', 'add-deps')
var fs = require('fs')

test('leaves', function (t) {
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
      { file: 'entry.css', deps: ['null.css'] },
      { file: 'null.css', deps: ['extra.css', 'undef.css'] },
    ])
  }, 200)
})

test('middle', function (t) {
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
      { file: 'entry.css', deps: ['null.css', 'extra.css'] },
      { file: 'null.css', deps: ['undef.css'] },
    ])
  }, 200)
})

