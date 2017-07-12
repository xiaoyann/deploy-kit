# deploy-kit

支持 ftp, sftp 等多种文件传输方式的文件部署工具。可以单独使用，也可以与 webpack, gulp 等工具集成，已内置 webpack, gulp 插件

```
yarn add deploy-kit --dev
```

## 使用 sftp 部署文件

- [x] 第一步 创建工具实例，并设置好相关配置

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
  // 要上传的文件
  files: '**',
  // 忽略文件
  ignore: 'dist/**/*.map',
  // 文件在远程服务器上的存放路径
  remoteDir: '/data1/htdocs/test-app'
})

// 开始上传
client.upload()
```

- [x] 结合 webpack

```js
const DeployPlugin = require('deploy-kit/plugins/webpack-plugin')

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

