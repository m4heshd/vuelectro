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
        //An array of all the source files for the main process. Make sure to define each new main process source file you create here.
        //Also make sure to keep all your source files INSIDE the ./src/ directory
        //Path should be relative to ./src/ directory. Vuelectro will mirror the filenames and directory structure to your output automatically
        srcFiles: [
            'electron-main.js'
        ]
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
