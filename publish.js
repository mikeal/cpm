var once = require('once')
  , WebTorrent = require('webtorrent')
  , path = require('path')
  , fs = require('fs')
  , request = require('request').defaults({json:true})
  , parseDocker = require('dockerfile-parse')

function parseDockerfile (dir, cb) {
  fs.readFile(path.join(dir, 'Dockerfile'), 'utf8', function (e, data) {
    var pojo = parseDocker(data)
    console.log(pojo)
    cb(null, pojo)
  })
}

function torrentStart (dir, cb) {
  cb = once(cb)
  var client = new WebTorrent()
  client.on('error', cb)
  client.seed(dir)
  client.on('torrent', function (torrent) {
    console.log(torrent)
    console.log(torrent.magnetURI)

    cb(null, torrent)
  })
}

function client (dir, cb) {
  dir = path.resolve(dir)
  parseDockerfile(dir, function (e, pojo) {
    if (e) return cb(e)
    torrentStart(dir, function (e, torrent) {
      publish(pojo, torrent, cb)
    })
  })
}

function publish (pojo, torrent, cb) {
  var pkg = {pojo:pojo, torrent:torrent}
  pkg.name = pojo.cpm_name
  pkg.version = pojo.cpm_version
  request.put('http://jason-service/cpm/publish', {json:pkg}, function (e, resp, data) {
    // TODO
    // * Return from the service an endpoint we can get a stream of upload progress
    // * Output the remote ends download progress in the CLI
  })
}

module.exports = client
