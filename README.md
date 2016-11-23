# ftp-deploy

```js
new DeployPlugin({
  hostname: '',
  username: '',
  password: '',
}, [
  {reg: /html$/, to: '/data1/htdocs/www.haha.com/app/views/'},
  {reg: /(js|css)$/, to: '/data1/htdocs/www.haha.com/public/static/'},
])
```