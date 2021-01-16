const { app, BrowserWindow } = require('electron');
const path = require('path');
let installExtension = require('electron-devtools-installer').default;

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

    // win.loadFile(path.resolve(".", "dist", "index.html")).then(() => {
    //     win.show();
    //     // win.webContents.openDevTools();
    // });
    win.loadURL("http://localhost:8080/").then(() => {
        win.show();
        win.webContents.openDevTools();
    });
}

app.on('ready', async () => {

    // Install Vue Devtools
    try {
        await installExtension({
            id: 'ljjemllljcmogpfapbkkighbhhppjdbg', //Vue Devtools beta
            electron: '>=1.2.1'
        })
    } catch (e) {
        console.error('Vue Devtools failed to install:', e.toString())
    }

    createWindow();
});

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
