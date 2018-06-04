const webpack = require('webpack');

module.exports = {
    devServer: {
        open: process.platform === 'darwin',
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || 8080,
        https: false,
        hotOnly: false,
        disableHostCheck: true
    },
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.API_URL': "'" + (process.env.API_URL || 'http://localhost:3000') + "'"
            })
        ]
    }
};