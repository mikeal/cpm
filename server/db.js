var request = require('request').defaults({json:true})

function db (url) {
  if (url[url.length-1] !== '/') url += '/'
  var exports = {}

  function updateDoc (id, func, cb) {
    var doc
    function _write () {
      try {
        doc = func(doc)
      } catch(e) {
        return cb(e)
      }
      console.log(url+encodeURIComponent(id))
      request.put(url+encodeURIComponent(id), {json:doc}, function (e, resp, info) {
        if (e) return cb(e)
        console.error('write status is', resp.statusCode)
        if (resp.statusCode === 409) {
          return updateDoc(id, func, cb)
        }
        if (resp.statusCode !== 201) {
          return cb(new Error('Status code not 201, '+resp.statusCode))
        }
        cb(null, info)
      })
    }
    if (id._rev) {
      doc = id
      id = id._id
      _write()
    } else {
      getDoc(id, function (e, _doc) {
        if (e) return cb(e)
        doc = _doc
        _write()
      })
    }
  }

  function writeDoc (doc, cb) {
    request.put(url+encodeURIComponent(doc._id), {json:doc}, function (e, resp, body) {
      if (e) return cb(e)
      if (resp.statusCode !== 201) return cb(new Error('Status code is not 200, '+resp.statusCode))
      cb(null, body)
    })
  }

  function getDoc (id, cb) {
    request(url+encodeURIComponent(id), function (e, resp, body) {
      if (e) return cb(e)
      if (resp.statusCode === 200) {
        return cb(null, body)
      }
      cb(new Error('Status code is not 200, '+resp.statusCode))
    })
  }
  function getDocs (ids, cb) {
    var opts = qs.stringify({keys:JSON.stringify(ids), include_docs:true})
    request(url+'_all_docs?'+opts, function (e, resp, body) {
      if (e) return cb(e)
      if (resp.statusCode !== 200) return cb(new Error('Status not 200, '+resp.statusCode))
      if (!body.rows) return cb(null, [])
      cb(null, body.rows.map(function (row) {return row.doc}))
    })
  }
  exports.get = getDoc
  exports.gets = getDocs
  exports.put = writeDoc
  exports.update = updateDoc

  return exports
}

module.exports = db
