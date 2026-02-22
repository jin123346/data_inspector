
//Electron 애플리케이션의 진입점(Entry Point) 이자 앱 전체 생명주기와 창(Window)을 관리하는 역할을 한다.
//

const { app, BrowserWindow, ipcMain, dialog } = require('electron');  //Electron 앱 실행과 종료 제어
const path = require('path');
const fs = require("fs");

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

app.whenReady().then(()=>{
    createWindow();

    //엑셀 파일 선택 IPC
    ipcMain.handle('dialog:openExcel',async () => {
        const result = await dialog.showOpenDialog({
            title: '엑셀 파일 선택',
            properties: ['openFile'],
            filters: [
                {name:'Excel Files',extensions:['xlsx','xls']},
                {name:'All Files',extensions:['*']},

            ]
        });

        if(result.canceled || result.filePaths.length===0){
            return null;
        }

        return result.filePaths[0];
    })

    ipcMain.handle("data:get", async (_e, filename) => {
        const p = path.join(__dirname, "renderer", "data", filename);
        const raw = fs.readFileSync(p, "utf-8");
        return JSON.parse(raw);
    });
});

app.on('window-all-closed',()=>{
    if (process.platform !=='darwin') app.quit();
})

