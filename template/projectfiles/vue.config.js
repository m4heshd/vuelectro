const {dependencies} = require('./package.json');
const {vRenderer} = require('./vuelectro.config');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    outputDir: './app/renderer',
    publicPath: '', // This is needed for the Electron renderer to load webpacked Vue source
    productionSourceMap: true, // Set this to false when doing final builds
    configureWebpack: {
        devtool: 'source-map',
        target: 'electron-renderer',
        externals: {
            ...Object.keys(dependencies || {}).filter(d => !vRenderer.bundleIn.includes(d)).reduce((moduleObj, module) => (moduleObj[module] = `require('${module}')`, moduleObj), {})
        },
        plugins: [
            ...vRenderer.obfuscate ? [new WebpackObfuscator(vRenderer.obfuscatorConfig)] : []
        ]
    }
};
