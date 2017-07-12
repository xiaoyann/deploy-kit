var Client = require('ftp');
var chalk = require('chalk');
var util = require('./util')


function FtpDeploy(conf) {
  this.filesQueue = [];
  this.connected = false;
  this.client = new Client();
  this.hostname = conf.hostname;
  this.username = conf.username;
  this.password = conf.username;
  this.client.on('ready', this.onReady.bind(this));
  this.client.on('close', this.onClose.bind(this));
  this.client.on('error', this.hanleError.bind(this));
}

FtpDeploy.prototype.connect = function() {
  if (!this.connected) {
    this.client.connect({
      host: this.hostname,
      user: this.username,
      password: this.password,
      keepalive: 10000,
    });
  } else {
    // 已是连接状态，手动执行 ready
    setTimeout(function() {
      this.onReady();
    }.bind(this), 0);
  }
}

FtpDeploy.prototype.deploy = function(files) {
  this.filesQueue = files;
  this.connect();
}

FtpDeploy.prototype.upload = function() {
  var file = this.filesQueue.shift();
  if (!file) return;
  var source = file.source || file.filename;
  this.client.put(source, file.to, function(err) {
    if (err) {
      util.failure(file);
      throw err;
    } else {
      this.upload();
      util.success(file);
    }
  }.bind(this));
}

FtpDeploy.prototype.onReady = function() {
  this.connected = true;
  // 连接成功后，开始上传文件
  this.upload();
  console.log();
}

FtpDeploy.prototype.onClose = function() {
  this.connected = false;
  // 连接关闭后，如果还有文件需要上传就再次发起连接
  if (this.filesQueue.length > 0) {
    this.connect();
  }
}

FtpDeploy.prototype.hanleError = function(err) {
  throw err;
}

module.exports = FtpDeploy;
