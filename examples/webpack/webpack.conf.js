const DeployPlugin = require('deploy-kit/plugins/sftp-webpack-plugin')

const webpackConfig = {
  plugins: [
    new DeployPlugin()
  ]
}

