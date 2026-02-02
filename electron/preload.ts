import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel: string, ...args: unknown[]) => {
        ipcRenderer.send(channel, ...args);
    },
    on: (channel: string, func: (...args: unknown[]) => void) => {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
    },
    once: (channel: string, func: (...args: unknown[]) => void) => {
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke: (channel: string, ...args: unknown[]) => {
        return ipcRenderer.invoke(channel, ...args);
    },
    isPackaged: process.env.NODE_ENV === 'production' || !!process.env.DIST,
});
