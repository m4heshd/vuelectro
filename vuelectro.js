#!/usr/bin/env node

const projectDir = process.cwd();

const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const glob = require('fast-glob');
const builder = require('electron-builder');
const vueService = require('@vue/cli-service');
const {info, done, error, warn} = require('@vue/cli-shared-utils');
const inquirer = require('inquirer');
const webpack = require('webpack');
const JavaScriptObfuscator = require('javascript-obfuscator');
const request = require('request');
const {install} = require('lmify');

let buildConfig = fs.pathExistsSync(path.join(projectDir, 'vuelectro.config.js')) ? require(path.join(projectDir, 'vuelectro.config')) : {};
const outDir = path.join(projectDir, 'app');
const srcDir = path.join(projectDir, 'src');

const service = new vueService(projectDir);

let args = process.argv.slice(2);

switch (args[0]) {
    case 'init':
        initVuelectro();
        break;
    case 'serve':
        cleanOutDir(true);
        serveDev();
        break;
    case 'build':
        cleanOutDir(true);
        buildProd();
        break;
    case 'compilemain':
        cleanOutDir();
        compileMain().catch(err => error(err));
        break;
    case 'clean':
        cleanOutDir(true);
        break;
    default:
        error('Invalid argument');
}

function initVuelectro() {
    info('Initializing Vuelectro project..\n');

    fs.pathExists(path.join(projectDir, 'vuelectro.config.js')).then((exists) => {
        if (exists) {
            let no = {name: 'No', value: false};
            inquirer.prompt({
                type: 'list',
                name: 'reinit',
                message: 'Vuelectro configuration already exists. Re-initializing will replace your source files and configurations. Are you sure want to continue?',
                choices: [no, no, no, no, no, {name: 'Ok, fine.', value: true}],
                default: false
            }).then(answers => {
                answers.reinit ? copyTemplate() : warn('Operation cancelled by user')
            }).catch(error => console.error(error));
        } else {
            copyTemplate();
        }
    })
}

function copyTemplate() {
    fs.copy(path.join(__dirname, 'template', 'projectfiles'), path.join(projectDir)).then(() => {
        info('Template files copied\n');
        editPkgJson();
    }).catch(err => console.error(err));
}

function editPkgJson() {
    let tmpltDeps;

    fs.readJson(path.join(__dirname, 'template', 'template-package.json')).then((tmpltJson) => {
        tmpltDeps = tmpltJson;

        fs.readJson(path.join(projectDir, 'package.json')).then(async (orgPkgJson) => {
            let newPkgJson = {
                ...orgPkgJson,
                main: tmpltDeps.main,
                "scripts": {
                    ...orgPkgJson.scripts,
                    ...tmpltDeps.scripts
                },
                "devDependencies": {
                    ...orgPkgJson.devDependencies,
                    ...tmpltDeps.devDependencies
                },
                browserslist: tmpltDeps.browserslist
            };

            newPkgJson.devDependencies.electron = await askElectronVersion(newPkgJson.devDependencies.electron);

            fs.writeJsonSync(path.join(projectDir, 'package.json'), newPkgJson, {spaces: '  '});
            fs.ensureDirSync(path.join(projectDir, 'resources'));
            fs.removeSync(path.join(projectDir, '.browserslistrc'));

            let gitignoreData = `\n# Vuelectro\n/dist_electron\n/app`
            let gitignorePath = path.join(projectDir, '.gitignore');
            fs.pathExistsSync(gitignorePath) ? fs.appendFileSync(gitignorePath, gitignoreData) : fs.outputFileSync(gitignorePath, gitignoreData);

            try {
                await install(['']);
                console.log();
            } catch {
                error('There was an error trying to install dependencies. Try running "npm install" manually.\n');
            }

            done('Vuelectro initialization completed successfully. Try "npm run electron:serve"');

        })
    }).catch(err => error(err));
}

function askElectronVersion(current) {
    return new Promise(resolve => {
        request('https://registry.npmjs.org/-/package/electron/dist-tags', { json: true }, (err, res, body) => {

            let versions = [
                {name: `${current} (preset)`, value: current},
                '15.3.1',
                '14.2.0',
                '13.6.1'
            ];

            if (!err && body.latest) {
                versions.unshift({name: `${body.latest} (latest)`, value: body.latest});
            } else {
                warn('Failed to fetch the latest version of Electron.\n');
            }

            inquirer.prompt({
                type: 'list',
                name: 'version',
                message: 'What version of Electron do you want to use?',
                choices: versions,
                default: current
            }).then(answers => {
                console.log();
                resolve(answers.version);
            }).catch(() => {
                error('Unable to show version selection. Choosing preset version.')
                resolve(current);
            });
        });
    });
}

function cleanOutDir(cleanAll = false) {
    if (buildConfig.cleanOutputDir) {
        try {
            if (cleanAll) {
                fs.emptyDirSync(outDir);
            } else {
                if (fs.existsSync(outDir)) {
                    fs.readdirSync(outDir).forEach(file => {
                        if (file !== 'renderer') fs.removeSync(path.join(outDir, file));
                    });
                }
            }
        } catch (err) {
            error(err);
        }
    }
}

function serveDev() {
    service.init("development");
    service.run('serve').then(({server, url}) => {
        compileMain().then(() => {
            info('Launching Electron...');

            let electron = spawn(path.join(projectDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron'), [...args.slice(1), 'app/electron-main.js'], {stdio: 'inherit'});

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

            if (buildConfig.cleanOutputDir) fs.emptyDirSync(path.join(projectDir, buildConfig.electron_builder.directories.output));

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

async function copyMain() {
    const files = await glob(buildConfig.vMain.srcFiles, {cwd: srcDir});

    files.forEach((file, idx) => {
        fs.copySync(path.join(srcDir, file), path.join(outDir, file));
        console.log(`[${idx + 1}].. ${path.parse(file).base} √`);
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

async function obfuscateMain(_mode = 'development') {
    info('Obfuscating your code..\n');

    let sourceMap = false;

    if (_mode === 'production') {
        if (buildConfig.vMain.productionSourceMap) {
            sourceMap = buildConfig.vMain.obfuscatorConfig.sourceMap || true;
        }
    } else {
        sourceMap = buildConfig.vMain.obfuscatorConfig.sourceMap;
    }

    const files = await glob(buildConfig.vMain.srcFiles, {cwd: srcDir});

    files.forEach((file, idx) => {
        let srcData = fs.readFileSync(path.join(srcDir, file), 'utf8');
        let filename = path.parse(file).base;

        let srcObfuscated = JavaScriptObfuscator.obfuscate(srcData, {
            ...buildConfig.vMain.obfuscatorConfig,
            inputFileName: filename,
            sourceMapFileName: `${filename}.map`
        });

        fs.outputFileSync(path.join(outDir, file), srcObfuscated.getObfuscatedCode());

        if (sourceMap) fs.outputFileSync(path.join(outDir, `${file}.map`), srcObfuscated.getSourceMap());

        console.log(`[${idx + 1}].. ${path.parse(file).base} √`);
    });
}
