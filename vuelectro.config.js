module.exports = {
    //electron-builder configuration goes here
    //Visit https://www.electron.build/configuration/configuration for instructions
    electron_builder: {
        appId: 'Vuelectro',
        win: {
            target: ['dir']
        },
        directories: {
            output: 'dist_electron'
        },
        files: [
            "!src${/*}",
            "!babel.config.js",
            "!vue.config.js",
            "!vue.electron.js"
        ]
    }
}
