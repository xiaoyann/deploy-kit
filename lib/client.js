const fs = require('fs')
const path = require('path')
const Scp2 = require('scp2').Client
const async = require('async')
const glob = require('glob')
const minimatch = require("minimatch")
const util = require('./util')


function isString(obj) {
  return typeof obj === 'string'
}

function toArray(obj) {
  if (typeof obj === 'undefined') {
    return []
  }
  return Array.isArray(obj) ? obj : [obj]
}

function pickFiles(patterns, options, callback) {
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

function upload(client, files, callback) {
  if (files.length === 0) {
    return callback(null)
  }

  const file = files.shift()

  function after(err) {
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
  }

  if (typeof file.content !== 'undefined') {
    const options = {
      source: file.filepath,
      destination: file.dest,
      content: file.content,
      attrs: file.stats || {}
    }
    client.write(options, after)
  } else {
    client.upload(file.filepath, file.dest, after)
  }
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
  return {
    username: matched[1],
    password: matched[2],
    host: matched[3],
    port: matched[4] || 22
  }
}


// Example:
// new Client({
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
function Client(options) {
  this.workspace = options.workspace
  this.deployTo = options.deployTo
  this.ignore = isString(options.ignore) ? [options.ignore] : options.ignore
  this.rules = []

  if (options.rules) {
    options.rules.map(this.match.bind(this))
  }

  this.connect(takeServerInfo(options.server))
}

// 匹配文件
Client.prototype.match = function(rule) {
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
Client.prototype.upload = function(files) {
  const self = this

  function callback(err) {
    self.client.close()
    if (err) throw err
  }

  function startUpload(files) {
    const startTime = Date.now()
    upload(self.client, self.process(files), function(err) {
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
    pickFiles(['**'], {
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
Client.prototype.process = function(files) {
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

module.exports = Client
