var once = require('once')
  , WebTorrent = require('webtorrent')
  , path = require('path')
  , fs = require('fs')
  , request = require('request').defaults({json:true})
  , parseDocker = require('./dockerfile-parse')

function parseDockerfile (dir, cb) {
  fs.readFile(path.join(dir, 'Dockerfile'), 'utf8', function (e, data) {
    console.error(data)
    var pojo = parseDocker(data)
    cb(null, pojo)
  })
}

function torrentStart (dir, cb) {
  cb = once(cb)
  var client = new WebTorrent()
  client.on('error', cb)
  client.seed(dir)
  console.error('SEED', dir)
  client.on('torrent', function (torrent) {
    console.log(torrent.magnetURI)

    cb(null, torrent)
  })
}

function client (dir, opts, cb) {
  dir = path.resolve(dir)
  parseDockerfile(dir, function (e, pojo) {
    if (e) return cb(e)
    torrentStart(dir, function (e, torrent) {
      publish(pojo, torrent, opts.service, cb)
    })
  })
}

function publish (pojo, torrent, service, cb) {
  var pkg =
    { pojo:pojo
    , torrent:
      { magnet: torrent.magnetURI
      , infoHash: torrent.parsedTorrent.infoHash
      , files: torrent.parsedTorrent.files
      , length: torrent.parsedTorrent.length
      , pieceLength: torrent.parsedTorrent.pieceLength
      , lastPieceLength: torrent.parsedTorrent.lastPieceLength
      , pieces: torrent.parsedTorrent.pieces
      }
    }
  pkg.name = pojo.env.CPM_NAME
  pkg.version = pojo.env.CPM_VERSION
  request.put(service+'/cpm/publish', {json:pkg}, function (e, resp, data) {
    throw new Error('OMG YOU DID IT!')
    // TODO
    // * Return from the service an endpoint we can get a stream of upload progress
    // * Output the remote ends download progress in the CLI
  })
}

module.exports = client
