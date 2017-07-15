const client = require('../lib')
const inherits = require('util').inherits
const DeployPlugin = require('../lib/util').DeployPlugin

inherits(SftpDeployPlugin, DeployPlugin)

function SftpDeployPlugin(options) {
  this.client = client.sftp(options)
  DeployPlugin.call(options)
}

module.exports = SftpDeployPlugin
