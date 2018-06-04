module.exports = {
    devServer: {
        open: process.platform === 'darwin',
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || 8080,
        https: false,
        hotOnly: false,
        disableHostCheck: true
    }
};