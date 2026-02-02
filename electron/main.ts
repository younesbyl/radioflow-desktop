import { app, BrowserWindow, Menu, session, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            devTools: !app.isPackaged
        },
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        title: 'RadioFlow',
    });

    // Set final application menu
    Menu.setApplicationMenu(null);

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(() => {
    // Configure permissive CSP for radio stream compatibility
    if (session.defaultSession) {
        session.defaultSession.webRequest.onHeadersReceived((details: any, callback: any) => {
            const filteredHeaders = { ...details.responseHeaders };

            // Security Configuration:
            // Remove restrictive headers (COOP/COEP/CORP) to ensure compatibility
            // with diverse audio streams and metadata from external servers.
            delete filteredHeaders['cross-origin-embedder-policy'];
            delete filteredHeaders['cross-origin-opener-policy'];
            delete filteredHeaders['cross-origin-resource-policy'];

            callback({
                responseHeaders: {
                    ...filteredHeaders,
                    'Content-Security-Policy': [
                        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
                        "media-src *; " +
                        "connect-src *; " +
                        "img-src * data: blob:;"
                    ]
                }
            });
        });
    }

    createWindow();
});

ipcMain.handle('fetch-proxy', async (_event: any, url: string, isDirectIp: boolean = false) => {
    try {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'User-Agent': 'RadioFlow/1.1 (Electron)',
        };
        if (isDirectIp) {
            headers['Host'] = 'de1.api.radio-browser.info';
        }
        const response = await axios.get(url, {
            headers,
            timeout: 15000,
            validateStatus: (status) => status < 500,
        });
        return response.data;
    } catch (error: any) {
        console.error(`[Main] Proxy fetch error:`, error.message);
        throw error;
    }
});
