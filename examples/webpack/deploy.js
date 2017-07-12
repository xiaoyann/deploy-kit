/**
 * 基本用法案例
 */

const path = require('path')
const Client = require('deploy-kit/lib/scp2')
const client = new Client()

// 设置账号信息
client.connect({
  host: '', // 服务器地址
  username: '', // 用户名称
  password: '' // 用户密码
})

//
client.config({
  // 需要上传的文件的根路径
  root: path.join(__dirname, 'dist'),
  // 上传 dist 下的所有文件
  files: '**',
  // 忽略所有 .map 文件
  ignore: 'dist/**/*.map',
  // 文件在远程服务器上的存放路径
  remoteDir: '/data1/htdocs/test-app'
})


/**
 * 注意：
 * match 规则不是必须的，但可以根据需求更细粒度的定制上传策略
 */

// 除了 html 文件都上传到指定的 public/static 下
client.match(/dist\/(.*)$/, 'public/static/[$1]')

// html 文件上传到 app/views 下，并将后缀改为 .phtml
client.match(/views\/((?:[^/]+\/)*?[^\/]+).html$/, 'app/views/[$1].phtml')

// 开始上传
// client.upload()

// 导出 Client 实例，提供给 webpack-plugin 使用，
// webpack-plugin 会自动调用 client.upload
module.exports = client
