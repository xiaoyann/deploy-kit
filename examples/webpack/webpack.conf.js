const client = require('./deploy')
const DeployPlugin = require('deploy-kit/plugins/webpack-plugin')

const webpackConfig = {
  plugins: [
    // webpack-plugin 会自动调用 client.upload
    new DeployPlugin(client)
  ]
}

