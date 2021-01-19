const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const builder = require('electron-builder');
const vueService = require('@vue/cli-service');
const {info, done, error} = require('@vue/cli-shared-utils');
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
        compileMain();
        break;
    default:
        console.error('Invalid argument');
}

function serveDev() {
    service.init("development");
    service.run('serve').then(({server, url}) => {
        compileMain();

        info('Launching Electron...');

        let electron = spawn(path.join(projectDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron'), ['app/electron-main.js'], {stdio: 'inherit'});

        electron.on('exit', function (code) {
            process.exit(0);
        });
    }).catch((err) => {
        error(err.stack);
    });
}

function buildProd() {
    service.init("production");
    service.run('build').then(() => {
        compileMain();

        info('Packaging Electron app...');

        builder.build({config: buildConfig.electron_builder}).then(() => {
            done('Build successful');
        }).catch((error) => {
            error(error.stack);
        });
    }).catch((err) => {
        error(err.stack);
    });
}

function compileMain() {
    info('Building main process..\n');
    copyMain();
    console.log();
    done('Main process build completed\n')
}

function copyMain() {
    buildConfig.vMain.srcFiles.forEach((file, idx) => {
        try {
            fs.copySync(path.join(projectDir, 'src', file), path.join(projectDir, 'app', file));
            console.log(`[${idx + 1}].. ${path.parse(file).base} ✔`);
        } catch (err) {
            error(err);
        }
    });
}
