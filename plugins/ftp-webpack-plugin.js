var path = require('path');
var Deploy = require('../lib/ftp');

/**
 * conf 账号配置
 * @conf.hostname 主机
 * @conf.username 账号
 * @conf.password 密码
 *
 * <Array>strategies 上传策略
 * @strategies.reg 匹配文件的正则表达式
 * @strategies.to  要上传到的服务器路径 
 *
 * example:
 *   new DeployPlugin({
 *     hostname: '',
 *     username: '',
 *     password: '',
 *   }, [
 *     {reg: /html$/, to: '/data1/htdocs/www.haha.com/app/views/'},
 *     {reg: /(js|css)$/, to: '/data1/htdocs/www.haha.com/public/static/'},
 *   ])
 */
function DeployPlugin(conf, strategies) {
  this.ftpClient = new Deploy(conf);
  this.strategies = strategies;
}

DeployPlugin.prototype.apply = function(compiler) {
  var self = this;
  var strategies = this.strategies;
  
  compiler.plugin('done', function(stats) {
    var filesQueue = [];
    var assets = stats.compilation.assets;

    for (var filename in assets) {
      strategies.forEach(function(strategy) {
        var to = strategy.to;
        var file = assets[filename];
        if (strategy.reg.test(filename)) {
          filesQueue.push({
            size: file.size(),
            to: path.join(to, filename),
            filename: filename,
            source: new Buffer(file.source(), 'utf-8')
          });
        }
      });
    }

    self.ftpClient.deploy(filesQueue);
  });
}


module.exports = DeployPlugin;
