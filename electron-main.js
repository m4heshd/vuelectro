'use strict'

// This intercepts the error message box shown by Electron in case of an uncaughtException
process.on('uncaughtException', (error => {
    console.error(error);
}));

const { app, BrowserWindow } = require('electron');

// Get and switch Vuelectro build type
let VUELECTRO_ENV = process.env.VUELECTRO_ENV ? process.env.VUELECTRO_ENV : 'build';

let rndURL = `file://${__dirname}/dist/index.html`;
let isDev = false;

switch (VUELECTRO_ENV) {
    case 'run' || 'devprod':
        isDev = true;
        break;
    case 'serve':
        isDev = true;
        rndURL = 'http://localhost:8080/';
        break;
    case 'prod' || 'build':
        isDev = false;
        break;
}

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Use the promise returned by loadURL() in combination with show:false and win.show() to avoid showing the window before content is loaded
    win.loadURL(rndURL).then(() => {
        win.show();
        if (isDev) win.webContents.openDevTools(); // Open dev tools on development mode
    });
}

app.on('ready', async () => {
    if (isDev) {
        // Install Vue Devtools
        try {
            await require('electron-devtools-installer').default({
                id: 'ljjemllljcmogpfapbkkighbhhppjdbg', //Vue Devtools beta
                electron: '>=1.2.1'
            })
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }

    createWindow();
});

// Prevent app from hanging around if all windows are closed
app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// End main process if Electron instance has already been terminated
app.on('quit', () => {
    process.exit(0);
});
