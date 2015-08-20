var once = require('once')
  , WebTorrent = require('webtorrent')
  , path = require('path')
  , fs = require('fs')
  , request = require('request').defaults({json:true})
  , parseDocker = require('./dockerfile-parse')

function parseDockerfile (dir, cb) {
  fs.readFile(path.join(dir, 'Dockerfile'), 'utf8', function (e, data) {
    console.log("Parsing dockerfile.")
    var pojo = parseDocker(data)
    cb(null, pojo)
  })
}

function torrentStart (dir, opts, cb) {
  cb = once(cb)
  console.log("Creating torrent.")
  var client = new WebTorrent({dht:false})
  client.on('error', cb)
  client.seed(dir, opts, function (torrent) {
    console.log('Seeding:', torrent.magnetURI)
    cb(null, torrent)
  })
}

function client (dir, opts, cb) {
  dir = path.resolve(dir)
  parseDockerfile(dir, function (e, pojo) {
    if (e) return cb(e)
    var pkg = { pojo:pojo }
    pkg.name = pojo.env.CPM_NAME
    pkg.version = pojo.env.CPM_VERSION
    torrentStart(dir, {name: pkg.name+'@'+pkg.version }, function (e, torrent) {
      pkg.torrent =
        { magnet: torrent.magnetURI
        , infoHash: torrent.parsedTorrent.infoHash
        , files: torrent.parsedTorrent.files
        , length: torrent.parsedTorrent.length
        , pieceLength: torrent.parsedTorrent.pieceLength
        , lastPieceLength: torrent.parsedTorrent.lastPieceLength
        , pieces: torrent.parsedTorrent.pieces
        }
      publish(pkg, opts.service, cb)
    })
  })
}

function publish (pkg, service, cb) {
  request.put(service+'/cpm/publish', {json:pkg}, function (e, resp, data) {
    if (e) return cb(e)
    if (resp.statusCode !== 200) {
      return cb(new Error('Status is not 200, '+resp.statusCode))
    }
    throw new Error('OMG YOU DID IT!')
    // TODO
    // * Return from the service an endpoint we can get a stream of upload progress
    // * Output the remote ends download progress in the CLI
  })
}

module.exports = client
