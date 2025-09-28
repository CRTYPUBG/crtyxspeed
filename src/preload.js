const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  optimizeNetwork: () => ipcRenderer.invoke('optimize-network'),
  revertNetwork: () => ipcRenderer.invoke('revert-network'),
  getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
  getStoredData: (key) => ipcRenderer.invoke('get-stored-data', key),
  setStoredData: (key, value) => ipcRenderer.invoke('set-stored-data', key, value),
  isAdmin: () => ipcRenderer.invoke('is-admin'),
  
  onOptimizationComplete: (callback) => ipcRenderer.on('optimization-complete', callback),
  onRevertComplete: (callback) => ipcRenderer.on('revert-complete', callback),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});