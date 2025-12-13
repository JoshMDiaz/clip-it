const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  formatText: (prompt, model) => ipcRenderer.invoke('format-text', { prompt, model })
});

