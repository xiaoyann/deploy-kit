const Scp2 = require('scp2').Client
const Deploy = require('./deploy')
const inherits = require('util').inherits

inherits(SftpDeploy, Deploy)

function SftpDeploy(options) {
  Deploy.call(this, options)
}

SftpDeploy.prototype.initClient = function(options) {
  this.client = new Scp2()
  this.client.defaults(options)
}

SftpDeploy.prototype.upload = function(file, callback) {
  if (typeof file.content !== 'undefined') {
    const options = {
      source: file.filepath,
      destination: file.dest,
      content: file.content,
      attrs: file.stats || {}
    }
    this.client.write(options, callback)
  } else {
    this.client.upload(file.filepath, file.dest, callback)
  }
}

module.exports = SftpDeploy
