/**
 * Deploy is a base class.
 * This class must be inherited and implement the initClient, upload and end method before use.
 */

const fs = require('fs')
const path = require('path')
const minimatch = require("minimatch")
const util = require('./util')

function upload(client, files, callback) {
  if (files.length === 0) {
    return callback(null)
  }
  const file = files.shift()
  client.upload(file, function(err) {
    if (err) {
      util.failure(file)
      callback(err)
    } else {
      util.success(file)
      if (files.length > 0) {
        upload(client, files, callback)
      } else {
        callback(null)
      }
    }
  })
}

function customDest(file, rule) {
  const pattern = rule.test
  const matched = file.filepath.match(pattern)
  if (matched) {
    file.dest = rule.dest.replace(/\[\$(\d+)\]/g, function(m, idx) {
      return matched[idx]
    })
  }
}

function takeServerInfo(info) {
  const matched = /^([^\:]+)\:([^\:]+)@(.*?)(?:\:(\d+))?$/.exec(info)
  const options = {
    username: matched[1],
    password: matched[2],
    host: matched[3]
  }
  if (matched[4]) {
    options.port = matched[4]
  }
  return options
}

function readConfig() {
  let options = {}
  let cFile = path.resolve(process.cwd(), 'deploy.js')
  if (fs.existsSync(cFile)) {
    options = require(cFile)
  }
  return options
}


// Example:
// new Deploy({
//   server: 'xiaofeng:xiaofeng@10.13.3.4:22',
//   workspace: __dirname + '/dist',
//   ignore: 'dist/**/*.js',
//   deployTo: '/data1/htdocs/mizar/haha',
//   rules: [
//     {
//       test: /dist\/(.*)$/,
//       release: 'public/static/[$1]'
//     },
//     {
//       test: /dist\/(.*)$/,
//       release: 'public/static/[$1]'
//     }
//   ]
// })
function Deploy(options) {
  if (!options) {
    options = readConfig()
  }

  this.workspace = options.workspace
  this.deployTo = options.deployTo
  this.ignore = util.isString(options.ignore) ? [options.ignore] : options.ignore || []
  this.rules = []

  if (options.rules) {
    options.rules.map(this.match.bind(this))
  }

  this.initClient(takeServerInfo(options.server))
}

// 匹配文件
Deploy.prototype.match = function(rule) {
  this.rules.push({
    test: rule.test,
    dest: path.join(this.deployTo, rule.dest)
  })
}

// 开始上传
// @file.filename 本地文件名称
// @file.filepath 本地文件真实路径
// @file.content 文件内容
// @file.dest 远程文件名称
Deploy.prototype.exec = function(files) {
  const self = this

  function callback(err) {
    self.end()
    if (err) throw err
  }

  function startUpload(files) {
    const startTime = Date.now()
    upload(self, self.process(files), function(err) {
      const times = (Date.now() - startTime) / 1000
      util.notice(`Times: ${times}s  Files: ${files.length}`)
      callback(err)
    })
  }

  if (files) {
    // 过滤被忽略的文件
    files = files.filter(function(file) {
      return !self.ignore.some(function(pattern) {
        return minimatch(file.filename, pattern)
      })
    })
    startUpload(files)
  }
  else {
    util.pickFiles(['**'], {
      cwd: this.workspace,
      nodir: true,
      realpath: true,
      ignore: this.ignore
    }, function(err, files) {
      if (err) {
        callback(err)
      } else {
        startUpload(files)
      }
    })
  }
}

// 格式化文件
Deploy.prototype.process = function(files) {
  const rules = this.rules
  const workspace = this.workspace
  const deployTo = this.deployTo

  return files.map(function(file) {
    let filename

    if (typeof file === 'string') {
      filename = file
      file = {}
    } else {
      filename = file.filename
    }

    filename = filename.replace(workspace + '/', '')

    let filepath = path.join(workspace, filename)
    let dest = path.join(deployTo, filename)

    file.filename = filename
    file.filepath = filepath
    file.dest = dest

    // 应用自定义规则，修改远程文件名称
    rules.forEach(function(rule) {
      customDest(file, rule)
    })

    return file
  })
}

module.exports = Deploy
