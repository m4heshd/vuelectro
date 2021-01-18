module.exports = {
    //Specify the node modules you need for webpack to bundle into Vue renderer here
    rendererBundleIn: [
        'core-js',
        'vue',
        'vue-router',
        'vuex'
    ],

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
