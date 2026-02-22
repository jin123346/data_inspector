// 보안 브리지

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api',{
    openExcelDialog: ()=> ipcRenderer.invoke('dialog:openExcel')

});

contextBridge.exposeInMainWorld("dataAPI", {
  get: (filename) => ipcRenderer.invoke("data:get", filename),
});