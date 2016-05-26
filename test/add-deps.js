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
  b.plugin(depsPatch, function () {
    this.push({ file: 'entry.css', deps: ['null.css'] })
    this.push({ file: 'null.css', deps: ['extra.css'] })
  })
  del.sync(fixtures('build'))
  b.bundle().pipe(b.dest(fixtures('build')))
    .on('end', function () {
      t.equal(
        fs.readFileSync(fixtures('build', 'bundle.css'), 'utf8'),
        fs.readFileSync(fixtures('expected', 'bundle.css'), 'utf8')
      )
      t.end()
    })
})


