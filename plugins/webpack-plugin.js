function DeployPlugin(client) {
  this.client = client
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

module.exports = DeployPlugin
