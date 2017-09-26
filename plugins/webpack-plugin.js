const crypto = require('crypto')

function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

const cacheStore = {}

function DeployPlugin(options) {}

DeployPlugin.prototype.apply = function(compiler) {
  const self = this
  compiler.plugin('done', function(stats) {
    const files = []
    const assets = stats.compilation.assets

    Object.keys(assets).forEach(function(filename) {
      const file = assets[filename]
      const size = file.size()
      const source = file.source()
      const hash = md5(source)
      const cache = cacheStore[filename]
      if (cache !== hash) {
        files.push({
          size: size,
          filename: filename,
          content: new Buffer(source, 'utf-8'),
          stats: {}
        })
        cacheStore[filename] = hash
      }
    })

    self.client.exec(files)
  })
}

module.exports = DeployPlugin
