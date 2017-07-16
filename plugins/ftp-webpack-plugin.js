const client = require('../lib')
const inherits = require('util').inherits
const DeployPlugin = require('./webpack-plugin')

inherits(FtpDeployPlugin, DeployPlugin)

function FtpDeployPlugin(options) {
  this.client = client.ftp(options)
  DeployPlugin.call(options)
}

module.exports = FtpDeployPlugin
