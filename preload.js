// 보안 브리지

const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('api',{
    ping: ()=>'pong'
});