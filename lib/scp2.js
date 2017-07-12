const fs = require('fs')
const path = require('path')
const Scp2 = require('scp2').Client
const async = require('async')
const glob = require('glob')
const minimatch = require("minimatch")
const util = require('./util')

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


function Client() {
  this.client = new Scp2()
  // 文件根目录
  this.root = process.cwd()
  // 待上传的文件 pattern
  this.files = []
  // 不需要上传的文件 pattern
  this.ignore = []
  // 不匹配目录
  this.nodir = true
  // 远程路径
  this.remoteDir = ''
  // 规则
  this.rules = []
}

// 上传前需要先调用此方法
Client.prototype.connect = function(options) {
  // 设置账号
  // https://github.com/spmjs/node-scp2#methods
  this.client.defaults(options)
}

// 配置参数
Client.prototype.config = function(options) {
  const self = this

  this.files = toArray(options.files)
  this.ignore = toArray(options.ignore)

  ;[
    'remoteDir',
    'root'
  ].forEach(function(name) {
    if (typeof options[name] !== 'undefined') {
      self[name] = options[name]
    }
  })

  return this
}

// 匹配文件
Client.prototype.match = function(pattern, dest) {
  this.rules.push({
    pattern: pattern,
    dest: path.join(this.remoteDir, dest)
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
    pickFiles(this.files, {
      cwd: this.root,
      nodir: this.nodir,
      ignore: this.ignore,
      realpath: true
    }, function(err, files) {
      if (err) {
        callback(err)
      } else {
        startUpload(files)
      }
    })
  }
}

function customDest(file, rule) {
  const pattern = rule.pattern
  const matched = file.filepath.match(pattern)
  if (matched) {
    file.dest = rule.dest.replace(/\[\$(\d+)\]/g, function(m, idx) {
      return matched[idx]
    })
  }
}

// 格式化文件
Client.prototype.process = function(files) {
  const rules = this.rules
  const root = this.root
  const remoteDir = this.remoteDir

  return files.map(function(file) {
    let filename

    if (typeof file === 'string') {
      filename = file
      file = {}
    } else {
      filename = file.filename
    }

    filename = filename.replace(root + '/', '')

    let filepath = path.join(root, filename)
    let dest = path.join(remoteDir, filename)

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
