var fs = require('fs')
var path = require('path')
var Transform = require('stream').Transform

module.exports = function (b, patchFn) {
  b.on('reset', function reset() {
    applyPatch(b, createPatch(b, patchFn))
    return reset
  }())
}

function createPatch(b, patchFn) {
  var patch = []
  var res = []
  var pMap = {}
  var recorded = Object.create(null)
  var basedir = b._options.basedir || process.cwd()
  function write(row, enc, next) {
    if (row.file) {
      recorded[row.file] = true
    }
    next(null, row)
  }
  function end(next) {
    var self = this
    Promise.resolve()
    .then(function () {
      return patchFn.call(patch)
    })
    .then(function (rows) {
      if (Array.isArray(rows)) {
        patch = patch.concat(rows)
      }
    })
    .then(function () {
      var filesDetected = []
      patch.forEach(function (row) {
        row.file = path.resolve(basedir, row.file)
        row.deps = (row.deps || []).map(function (file) {
          return path.resolve(basedir, file)
        })
        res.push({ file: row.file, deps: row.deps })
        pMap[row.file] = row
        filesDetected = filesDetected.concat(row.file, row.deps)
        delete row.deps
      })
      return unique(filesDetected)
    })
    .then(function (files) {
      return Promise.all(files.map(function (file) {
        if (recorded[file]) {
          return
        }
        var row = pMap[file] || { file: file, id: file }
        row.entry = row.entry || false
        return fsStat(file).catch(function () {
          row.source = ''
        }).then(function () {
          self.push(row)
        })
      }))
    })
    .then(function () { next() }, this.emit.bind(this, 'error'))
  }
  b.pipeline.get('record').push(through(write, end))
  return res
}

function applyPatch(b, patch) {
  var file2row = new Map()

  function write(row, enc, next) {
    file2row.set(row.file, row)
    next()
  }
  function end(next) {
    patch.forEach(function (row) {
      var extraDeps = row.deps
      // file2row[row.file] has to exist,
      // cause we have pushed every module detected into the pipeline
      // in the stream appended to 'record' previously
      var deps = file2row.get(row.file).deps
      extraDeps.forEach(function (dep) {
        var id = file2row.get(dep).id
        if (values(deps).indexOf(id) === -1) {
          deps[relative(row.file, dep)] = id
        }
      })
    })
    removeEmpty(file2row)
    file2row.forEach(function (row) {
      this.push(row)
    }, this)
    next()
  }
  // we don't want to modify the contents of b._options.cache
  // which would be collected by watchify in the end of 'deps'
  b.pipeline.splice(
    b.pipeline.indexOf('deps') + 1, 0,
    through(write, end)
  )
}

function removeEmpty(o) {
  var toDelete = []
  o.forEach(function (row) {
    if (!row.source && empty(row.deps)) {
      toDelete.push(row.file)
    }
  })
  var removed = toDelete.reduce(function (t, file) {
    var row = o.delete(file)
    t[row.id] = file
    return t
  }, Object.create(null))

  if (Object.keys(removed).length) {
    var recurse = false
    o.forEach(function (row) {
      if (removeValues(row.deps, removed)) {
        recurse = true
      }
    })
    if (recurse) {
      removeEmpty(o)
    }
  }
}

function removeValues(o, val) {
  var res = false
  Object.keys(o).forEach(function (k) {
    var v = o[k]
    if (val[v]) {
      res = true
      delete o[k]
    }
  })
  return res
}

function empty(o) {
  return !o || !Object.keys(o).length
}

function unique(arr) {
  return Object.keys(arr.reduce(function (o, v) {
    o[v] = true
    return o
  }, {}))
}

function relative(from, to) {
  var res = path.relative(path.dirname(from), to)
  var relPrefix = '.' + path.sep
  var i = res.indexOf(relPrefix)
  if (i === -1 || i > 1) {
    res = relPrefix + res
  }
  return res
}

function through(write, end) {
  var s = Transform({ objectMode: true })
  s._transform = write
  s._flush = end
  return s
}

function fsStat(file) {
  return new Promise(function (resolve, reject) {
    fs.stat(file, function (err) {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function values(o) {
  return Object.keys(o).map(function (k) {
    return o[k]
  })
}

