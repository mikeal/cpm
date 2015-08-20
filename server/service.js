var http = require('http')
  , request = require('request')
  , response = require('response')
  , body = require('body/any')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')
  , qs = require('querystring')
  , hashRouter = require('http-hash-router')
  , mkdb = require('./db')
  , FSStorage = require('webtorrent/lib/fs-storage')
  , WebTorrent = require('webtorrent')
  ;

function service (opts) {
  var router = hashRouter()
    , db = mkdb(opts.db)
    , torrents = {}
    ;

  function Storage (torrent, _opts) {
    console.error(torrent)
    throw new Error("fixme")
    _opts.path = path.join(opts.storagePath, torrent.name)
    return new FSStorage(torrent, _opts)
  }

  router.set('/', function (req, res) {
    var p = path.join(__dirname, 'index.html')
    fs.createReadStream(p).pipe(response.html()).pipe(res)
  })
  router.set('/cpm/torrent/:name/:version', function (req, res) {
    // return a feed of changes from our seeding torrent.
  })
  router.set('/cpm/publish', function (req, res) {
    body(req, function (err, data) {
      if (err) return response.error(err).pipe(res)
      if (!data.name || !data.version || !data.torrent) {
        return response.error(new Error('Missing required fields.')).pipe(res)
      }
      function _update (doc) {
        // if (doc.versions[data.version]) throw new Error('Version already exists')
        doc.versions[data.version] = data
        return doc
      }
      function finish (e, info) {
        console.error('FINISHED', e, info)
        if (e) return response.error(e).pipe(res)
        console.log('Adding torrent.', data.torrent.magnet)
        var client = new WebTorrent({dht:false, storage:Storage})
        client.on('error', console.error)
        client.on('warning', console.error)
        var torrent = client.add(data.torrent.magnet, function (torrent) {
          console.log('Added torrent', torrent)
          torrents[torrent.name] = torrent
          throw new Error('fixme add toreent')
        })
        setInterval(function () {console.log(torrent.downloaded)}, 1000)
      }
      db.get(data.name, function (e, doc) {
        if (e) {
          doc = _update({_id: data.name, versions:{}})
          db.put(doc, finish)
        } else {
          console.log('update doc', doc._rev)
          db.update(doc, _update, finish)
        }
      })
    })
  })

  var server = http.createServer(function(req, res) {
    router(req, res, {}, function (err) {
      return response.error(404).pipe(res)
    })
  })

  return server
}

module.exports = service
module.exports.testService = function () {
  return service({db:'http://mikeal.cloudant.com/cpm'})
}
