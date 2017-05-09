# deploy-kit

deploy files to a server

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