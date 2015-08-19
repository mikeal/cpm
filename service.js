var http = require('http')
  , request = require('request')
  , response = require('response')
  , body = require('body/any')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')
  , qs = require('querystring')
  , hashRouter = require('http-hash-router')
  ;

function service (opts) {
  var router = hashRouter()
  router.set('/', function (req, res) {
    var p = path.join(__dirname, 'index.html')
    fs.createReadStream(p).pipe(response.html()).pipe(res)
  })
  router.set('/cpm/publish', function (req, res) {
    body(req, function (err, data) {
      if (err) return response.error(err).pipe(res)
      // TODO write data
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
