var chalk = require('chalk')

exports.success = function(file) {
  file.to = file.to || file.dest
  var desc = chalk.cyan(`${file.filename} ${chalk.white('===>')} ${file.to}`)
  console.log(chalk.greenBright('upload success :'), desc)
}

exports.failure = function(file) {
  file.to = file.to || file.dest
  var desc = chalk.yellow(`${file.filename} ${chalk.white('===>')} ${file.to}`)
  console.log(chalk.redBright('upload failure :'), desc)
}

exports.notice = function(message) {
  console.log(message)
}

function DeployPlugin(options) {
}

DeployPlugin.prototype.apply = function(compiler) {
  const self = this
  compiler.plugin('done', function(stats) {
    const assets = stats.compilation.assets
    const files = Object.keys(assets).map(function(filename) {
      const file = assets[filename]
      return {
        size: file.size(),
        filename: filename,
        content: new Buffer(file.source(), 'utf-8'),
        stats: {}
      }
    })
    self.client.upload(files)
  })
}

exports.DeployPlugin = DeployPlugin
