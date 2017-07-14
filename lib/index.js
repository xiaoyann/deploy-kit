const Sftp = require('./sftp')

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
