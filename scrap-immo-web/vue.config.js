module.exports = {
    devServer: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
        https: false,
        hotOnly: false,
    }
};