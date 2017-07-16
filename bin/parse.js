const path = require('path')
const fs = require('fs')
const program = require('commander')
const client = require('../lib')
const package = require('../package.json')
const cwd = process.cwd()


// display usage
program
  .version(package.version)
  .usage('[options] [workspace] [deployTo]')
  .option('-c, --config <path>', 'use configuration from this file')
  .option('-s, --server <address>', 'server account, address. (e.g. user:pwd@address:port)')
  .option('-i, --ignore <pattern>', 'ignore the matched files')


// display examples
program.on('--help', function(){
  console.log()
  console.log('  Examples:')
  console.log()
  console.log('    // use configuration from a file')
  console.log('    $ deploy --config deploy.js')
  console.log('    // deploy files in ./dist to /data1/htdocs/testapp on 10.13.1.2')
  console.log('    $ deploy -s user:pwd@10.13.1.2:22 --i *.map ./dist /data1/htdocs/testapp')
  console.log()
  console.log('  version: ' + package.version)
})


program.parse(process.argv)


const config = {
  // server account, address, port
  //  e.g. username:password@server_address:port
  server: '',
  // deploy all files in the directory
  workspace: '',
  // ignore the matched files
  //  e.g. dist/**/*.js'
  ignore: '',
  // destination
  // e.g. /data1/htdocs/mizar/haha
  deployTo: '',
  rules: [
    // {
    //   test: /dist\/(.*)$/,
    //   release: 'public/static/[$1]'
    // },
  ]
}


// read configuration from local file
function readConfig() {
  let options = {}
  let cFile = ''

  if (program.config) {
    cFile = path.resolve(cwd, program.config)
    if (fs.existsSync(cFile)) {
      Object.assign(config, require(cFile))
    } else {
      console.warn(`Cannot find configuration file ${program.config}`)
      process.exit()
    }
  } else {
    cFile = path.resolve(cwd, 'deploy.js')
  }

  if (fs.existsSync(cFile)) {
    options = require(cFile)
  }

  ;['server', 'ignore'].forEach(function(name) {
    if (typeof program[name] !== 'undefined') {
      options[name] = program[name]
    }
  })

  if (program.args[0]) {
    options.workspace = path.resolve(cwd, program.args[0])
  }

  if (program.args[1]) {
    options.deployTo = program.args[1]
  }

  return options
}


Object.assign(config, readConfig())


// validate required options
;['server', 'workspace', 'deployTo'].some(function(name) {
  if (!config[name]) {
    console.log(`${name} required, please check your configuration.`)
    process.exit()
  }
})

module.exports = config
