const Scp2 = require('scp2').Client
const Client = require('./client')
const inherits = require('util').inherits

inherits(Sftp, Client)

function Sftp(options) {
  this.client = new Scp2()
  Client.call(this, options)
}

Sftp.prototype.connect = function(options) {
  // https://github.com/spmjs/node-scp2#methods
  this.client.defaults(options)
}

module.exports = Sftp
