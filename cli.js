var program = require('commander')
  , publish = require('./client/publish')
  , install = require('./client/install')
  , fs = requrie('fs')
  , path = require('path')

program
  .version(require('./package.json').version)
  .option('-p, --push', 'Publish a docker image')
  .option('-i --pull', 'Install a docker image locally')
  .option('-r --run', 'Run a docker image while pulling.')
  .parse(process.argv);

var opts
try {
  opts = fs.readFileSync(path.join(process.env.HOME, '.cpmrc'))
} catch (e) {
  opts = {}
}

function defaults (opts) {
  if (!opts.service) opts.service = 'http://jason-service'
  return opts
}

opts = defaults(opts)

if (program.publish) {
  publish(program.publish)
}
