const chalk = require('chalk')

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
