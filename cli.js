var program = require('commander')
  ,  publish = require('./publish')

program
  .version(require('./package.json').version)
  .option('-p, --publish', 'Publish a docker image')
  .parse(process.argv);

if (program.publish) {
  publish(program.publish)
}
