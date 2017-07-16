const Sftp = require('./sftp')
const Ftp = require('./ftp')

/**
 * usage:
 * const deploy = require('deploy-kit')
 * deploy.sftp({
 *   ...
 * })
 */

exports.sftp = function(options) {
  return new Sftp(options)
}

exports.ftp = function(options) {
  return new Ftp(options)
}
