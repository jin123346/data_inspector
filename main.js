
//Electron 애플리케이션의 진입점(Entry Point) 이자 앱 전체 생명주기와 창(Window)을 관리하는 역할을 한다.
//

const {app, BrowserWindow} = require('electron');  //Electron 앱 실행과 종료 제어
const path = require('path');

function createWindow(){
    const win = new BrowserWindow({
        width : 1200,
        height : 800,
        webPreferences: {
            preload: path.join(__dirname,'preload.js')
        }
    });

    win.loadFile(path.join(__dirname,'renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed',()=>{
    if (process.platform !=='darwin') app.quit();
})