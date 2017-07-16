const Ftp = require('ftp')
const Deploy = require('./deploy')
const inherits = require('util').inherits

inherits(FtpDeploy, Deploy)

function FtpDeploy(options) {
  Deploy.call(this, options)
}

FtpDeploy.prototype.initClient = function(options) {
  this.client = new Ftp()
  this.client.connect({
    user: options.username,
    password: options.password,
    host: options.host,
    port: options.port || 21
  })
}

/**
 * file: {
 *   filename: '',
 *   filepath: '',
 *   content: '',
 *   dest: ''
 * }
 */
FtpDeploy.prototype.upload = function(file, callback) {
  this.client.put(typeof file.content !== 'undefined' ? file.content : file.filepath, file.dest, callback)
}

FtpDeploy.prototype.end = function() {
  this.client.end()
}

module.exports = FtpDeploy
