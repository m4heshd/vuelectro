'use strict'

// This intercepts the error message box shown by Electron in case of an uncaughtException. Needs to be on top of the main process.
process.on('uncaughtException', (error => {
    console.error(error);
}));

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Get and switch Vuelectro build type
let VUELECTRO_ENV = process.env.VUELECTRO_ENV || 'build';

// Set a global variable for the resource path to be used throughout the app (both in main and renderer)
global.__resPath = path.join(process.cwd(), 'resources')

let rndURL = `file://${__dirname}/renderer/index.html`; // Renderer entry URL
let isDev = false; // Set the Electron environment to development or production

// Change running environment and renderer source according to the executed command
switch (VUELECTRO_ENV) {
    case 'run':
    case 'devprod':
        isDev = true;
        break;
    case 'serve':
        isDev = true;
        rndURL = 'http://localhost:8080/';
        break;
    case 'build':
        global.__resPath = process.resourcesPath;
        break;
}

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
            additionalArguments: [__resPath]
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
                id: 'ljjemllljcmogpfapbkkighbhhppjdbg', // Vue Devtools beta
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
    process.exit();
});
