const chalk = require('chalk')
const glob = require('glob')
const async = require('async')

exports.isString = function(obj) {
  return typeof obj === 'string'
}

// match files by glob
// (https://github.com/isaacs/node-glob)
exports.pickFiles = function(patterns, options, callback) {
  async.map(
    patterns,
    function(pattern, next) {
      glob(pattern, options, next)
    },
    function(err, results) {
      if (err) {
        callback(err)
      } else {
        const files = results.reduce(function(files, item) {
          return files.concat(item)
        })
        callback(null, files)
      }
    }
  )
}

// display success message when upload success
exports.success = function(file) {
  file.to = file.to || file.dest
  var desc = chalk.cyan(`${file.filename} ${chalk.white('===>')} ${file.to}`)
  console.log(chalk.greenBright('upload success :'), desc)
}

// display failure message when upload failure
exports.failure = function(file) {
  file.to = file.to || file.dest
  var desc = chalk.yellow(`${file.filename} ${chalk.white('===>')} ${file.to}`)
  console.log(chalk.redBright('upload failure :'), desc)
}

// display notice message
exports.notice = function(message) {
  console.log(message)
}
