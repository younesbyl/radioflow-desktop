const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const axios = require('axios');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: 'RadioFlow',
    });

    Menu.setApplicationMenu(null);

    // In this debug mode, just load a remote URL or a local file if it exists
    const devUrl = 'http://localhost:5173';
    win.loadURL(devUrl).catch(() => {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    });
}

app.whenReady().then(createWindow);
