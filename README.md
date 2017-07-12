# deploy-kit

支持 ftp, sftp 等多种文件传输方式的文件部署工具。可以单独使用，也可以与 webpack, gulp 等工具集成，已内置 webpack, gulp 插件

```
yarn add deploy-kit --dev
```

## 使用 sftp 部署文件

* 基本用法 [最佳实战](./examples/basic)

```
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
  root: path.resolve(__dirname, '../dist')
  // 要上传的文件匹配规则，更多规则： glob(https://github.com/isaacs/node-glob#glob-primer)
  // 支持数组形式：files: ['*.js', '*.css']
  files: '**',
  // 忽略文件的匹配规则，支持数组形式
  // 更多规则： glob(https://github.com/isaacs/node-glob#glob-primer)
  ignore: 'dist/**/*.map',
  // 文件在远程服务器上的存放路径
  remoteDir: '/data1/htdocs/test-app'
})

// 开始上传
client.upload()
```

* 结合 webpack [最佳实战](./examples/webpack)

```js
const Client = require('deploy-kit/lib/scp2')
const client = new Client()
const DeployPlugin = require('deploy-kit/plugins/webpack-plugin')

client.connect(...)

client.config(...)

const webpackConfig = {
  ...
  plugins: [
    // 将工具实例后传给 webpack-plugin
    // 插件会在自动调用 client.upload 进行上传
    new DeployPlugin(client)
  ]
}
```

## ftp

```js
const FtpPlugin = require('deploy-kit/plugins/ftp-webpack-plugin')

new FtpPlugin({
  hostname: '',
  username: '',
  password: '',
}, [
  {
    reg: /html$/,
    to: '/data1/htdocs/www.haha.com/app/views/'
  },
  {
    reg: /(js|css)$/,
    to: '/data1/htdocs/www.haha.com/public/static/'
  },
])
```

