const {spawn} = require('child_process');
const path = require('path');
const vueService = require('@vue/cli-service');
const {info, error} = require('@vue/cli-shared-utils');

const service = new vueService(process.cwd());

let args = process.argv.slice(2);

switch (args[0]) {
    case 'serve':
        serveDev();
        break;
    default:
        console.error('Invalid argument');
}

function serveDev() {
    service.init("development");
    service.run('serve').then(({server, url}) => {
        info('Launching Electron...');

        let electron = spawn(path.join('node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron'), ['electron-main.js'], {stdio: 'inherit'});

        electron.on('exit', function (code) {
            process.exit(0);
        });
    }).catch((err) => {
        error(err.stack);
    });
}
