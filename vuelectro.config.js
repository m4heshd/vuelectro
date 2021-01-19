const {dependencies} = require('./package.json');
const path = require('path');

module.exports = {
    //Specify the node modules you need for webpack to bundle into Vue renderer here
    rendererBundleIn: [
        'core-js',
        'vue',
        'vue-router',
        'vuex'
    ],

    //Configuration for the main process
    vMain: {
        bundle: false, //Whether to webpack the main process or not
        productionSourceMap: false, //Source map support for production in main process

        //An array of all the source files for the main process. Make sure to define each new main process source file you create here.
        //Also make sure to keep all your source files INSIDE the ./src/ directory
        //Path should be relative to ./src/ directory. Vuelectro will mirror the filenames and directory structure to your output automatically
        srcFiles: [
            'electron-main.js'
        ],

        //webpack configuration for main process goes here
        //Visit https://webpack.js.org/guides/getting-started/#using-a-configuration for instructions
        webpackConfig: {
            devtool: 'source-map',
            target: 'electron-main',
            externals: {
                "electron-devtools-installer": "require('electron-devtools-installer')",
                ...Object.keys(dependencies || {}).reduce((moduleObj, module) => (moduleObj[module] = `require('${module}')`, moduleObj), {})
            },
            entry: path.join(process.cwd(), 'src', 'electron-main.js'),
            output: {
                filename: 'electron-main.js',
                path: path.join(process.cwd(), 'app')
            },
            node: {
                global: false,
                __filename: false,
                __dirname: false,
            }
        },
    },

    //electron-builder configuration goes here
    //Visit https://www.electron.build/configuration/configuration for instructions
    electron_builder: {
        appId: "Vuelectro",
        win: {
            target: ["dir"]
        },
        directories: {
            output: "dist_electron"
        },
        files: [
            "!src${/*}",
            "!babel.config.js",
            "!vue.config.js",
            "!vuelectro.config.js",
            "!vuelectro.js"
        ]
    }
}
