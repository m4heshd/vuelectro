const { dependencies } = require('./package.json')
const { rendererBundleIn } = require('./vuelectro.config')

module.exports = {
    outputDir: './app/renderer',
    publicPath: '',
    productionSourceMap: true,
    configureWebpack: {
        devtool: 'source-map',
        target: 'electron-renderer',
        externals: Object.keys(dependencies || {}).filter(d => !rendererBundleIn.includes(d))
    }
}
