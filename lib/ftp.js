const Ftp = require('ftp')
const Deploy = require('./deploy')
const inherits = require('util').inherits

inherits(FtpDeploy, Deploy)

function FtpDeploy(options) {
  Deploy.call(this, options)
}

FtpDeploy.prototype.initClient = function(options) {
  // this.client = new Scp2()
  // this.client.defaults(options)
}

FtpDeploy.prototype.upload = function(file, callback) {
  callback(new Error('todo。。。'))
  // if (typeof file.content !== 'undefined') {
  //   const options = {
  //     source: file.filepath,
  //     destination: file.dest,
  //     content: file.content,
  //     attrs: file.stats || {}
  //   }
  //   this.client.write(options, callback)
  // } else {
  //   this.client.upload(file.filepath, file.dest, callback)
  // }
}

module.exports = FtpDeploy
