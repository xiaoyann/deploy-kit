const scp2 = require('scp2')
const util = require('./util')

function Deploy(options) {
  this.client = scp2
  this.client.defaults({
    host: options.hostname,
    username: options.username,
    password: options.password
  })
}

// 上传文件
Deploy.prototype.upload = function(files) {
  if (files.length > 0) {
    const file = files.shift()
    this.client.write({
      source: file.filename,
      destination:file.to,
      content: file.source,
      attrs: file.stats || {}
    }, function(err) {
      if (err) {
        util.failure(file)
        throw err
      } else {
        util.success(file)
        if (files.length > 0) {
          this.upload(files)
        } else {
          this.client.close()
        }
      }
    }.bind(this))
  }
}

module.exports = Deploy
