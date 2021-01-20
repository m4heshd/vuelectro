const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const builder = require('electron-builder');
const vueService = require('@vue/cli-service');
const {info, done, error} = require('@vue/cli-shared-utils');
const webpack = require('webpack');
const JavaScriptObfuscator = require('javascript-obfuscator');
const buildConfig = require('./vuelectro.config');

const projectDir = process.cwd();

const service = new vueService(projectDir);

let args = process.argv.slice(2);

switch (args[0]) {
    case 'serve':
        serveDev();
        break;
    case 'build':
        buildProd();
        break;
    case 'compilemain':
        compileMain().catch(err => error(err));
        break;
    default:
        console.error('Invalid argument');
}

function serveDev() {
    service.init("development");
    service.run('serve').then(({server, url}) => {
        compileMain().then(() => {
            info('Launching Electron...');

            let electron = spawn(path.join(projectDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron'), ['app/electron-main.js'], {stdio: 'inherit'});

            electron.on('exit', function (code) {
                process.exit(0);
            });
        }).catch(err => error(err));
    }).catch((err) => {
        error(err.stack);
    });
}

function buildProd() {
    service.init("production");
    service.run('build').then(() => {
        compileMain('production').then(() => {
            info('Packaging Electron app...');

            builder.build({config: buildConfig.electron_builder}).then(() => {
                done('Build successful');
            }).catch((err) => {
                error(err.stack);
            });
        }).catch(err => error(err));
    }).catch((err) => {
        error(err.stack);
    });
}

function compileMain(mode = 'development') {
    info('Building main process..\n');

    return new Promise((resolve, reject) => {
        if (buildConfig.vMain.bundle) {
            webpackMain(mode).then(() => {
                console.log();
                done('Main process build completed\n')
                resolve();
            }).catch((err) => {
                reject(err);
            });
        } else {
            if (buildConfig.vMain.obfuscate) {
                obfuscateMain(mode).then(() => {
                    console.log();
                    done('Main process build completed\n')
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            } else {
                copyMain().then(() => {
                    console.log();
                    done('Main process build completed\n')
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            }
        }
    });
}

function copyMain() {
    return new Promise((resolve, reject) => {
        let _err;
        buildConfig.vMain.srcFiles.forEach((file, idx) => {
            try {
                fs.copySync(path.join(projectDir, 'src', file), path.join(projectDir, 'app', file));
                console.log(`[${idx + 1}].. ${path.parse(file).base} √`);
            } catch (err) {
                _err = err;
            }
        });
        _err ? reject(_err) : resolve();
    });
}

function webpackMain(_mode) {
    return new Promise((resolve, reject) => {
        let sourceMap = false;
        if (_mode === 'production') {
            if (buildConfig.vMain.productionSourceMap) {
                sourceMap = buildConfig.vMain.webpackConfig.devtool || 'source-map';
            }
        } else {
            sourceMap = buildConfig.vMain.webpackConfig.devtool;
        }

        webpack({
            mode: _mode,
            ...buildConfig.vMain.webpackConfig,
            devtool: sourceMap
        }, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            if (stats.hasErrors()) {
                reject(stats.toJson().errors);
                return;
            }

            console.log(stats.toString({
                chunks: false,
                colors: true
            }));
            resolve();
        });
    });
}

function obfuscateMain(_mode = 'development', files = buildConfig.vMain.srcFiles) {
    info('Obfuscating your code..\n');

    return new Promise((resolve, reject) => {
        let _err;
        let sourceMap = false;
        if (_mode === 'production') {
            if (buildConfig.vMain.productionSourceMap) {
                sourceMap = buildConfig.vMain.obfuscatorConfig.sourceMap || true;
            }
        } else {
            sourceMap = buildConfig.vMain.obfuscatorConfig.sourceMap;
        }

        buildConfig.vMain.srcFiles.forEach((file, idx) => {
            try {
                let srcData = fs.readFileSync(path.join(projectDir, 'src', file), 'utf8');
                let filename = path.parse(file).base;

                let srcObfuscated = JavaScriptObfuscator.obfuscate(srcData, {
                    ...buildConfig.vMain.obfuscatorConfig,
                    inputFileName: filename,
                    sourceMapFileName: `${filename}.map`
                });

                fs.outputFileSync(path.join(projectDir, 'app', file), srcObfuscated.getObfuscatedCode());

                if (sourceMap) fs.outputFileSync(path.join(projectDir, 'app', `${file}.map`), srcObfuscated.getSourceMap());

                console.log(`[${idx + 1}].. ${path.parse(file).base} √`);
            } catch (err) {
                _err = err;
            }
        });
        _err ? reject(_err) : resolve();
    });
}
