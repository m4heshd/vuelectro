'use strict'

// This intercepts the error message box shown by Electron in case of an uncaughtException
process.on('uncaughtException', (error => {
    console.error(error);
}));

const { app, BrowserWindow } = require('electron');
let installExtension = require('electron-devtools-installer').default;

// Get and switch Vuetron build type
let VUETRON_ENV = process.env.VUETRON_ENV;

let rndURL = `file://${__dirname}/dist/index.html`;
let isDev = true;

switch (VUETRON_ENV) {
    case 'serve':
        rndURL = 'http://localhost:8080/';
        break;
    case 'build':
        rndURL = 'app://./index.html';
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
            await installExtension({
                id: 'ljjemllljcmogpfapbkkighbhhppjdbg', //Vue Devtools beta
                electron: '>=1.2.1'
            })
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }

    createWindow();
});

// Prevent app from hanging around if all windows are closed on mac
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
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
