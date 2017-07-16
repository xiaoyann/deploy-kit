const client = require('deploy-kit')

client.sftp({
  server: 'user:pwd@server_address:port',
  workspace: __dirname + '/dist',
  deployTo: '/data1/htdocs/test-app',
  ignore: 'dist/**/*.map',
  rules: [
    {
      test: /dist\/(.*)$/,
      dest: 'public/static/[$1]'
    },
    {
      test: /views\/((?:[^/]+\/)*?[^\/]+).html$/,
      dest: 'app/views/[$1].phtml'
    }
  ]
})
.exec()


