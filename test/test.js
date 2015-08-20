var service = require('../server/service')
  , publish = require('../client/publish')
  , path = require('path')
  ;

var server = service({db:'https://mikeal.cloudant.com/cpm', storage:path.join(__dirname, 'store')})
  , dir = path.join(__dirname, 'empty-container')
  ;
server.listen(8080, function (e) {
  publish(dir, {service:'http://localhost:8080'}, function (e) {
    if (e) throw e
  })
})
