// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const question = require('./question.js')
const game = require('./game.js')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let scoreboardWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'js/preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./pages/index.html')
  mainWindow.webContents.once('did-finish-load', function(){
    mainWindow.webContents.send('candidateList', game.candidateList);
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('startGame', function(e, playerList){
    mainWindow.loadFile('./pages/choose.html');
    // Initialize current player list
    game.initPlayer(playerList);
    console.log("Player List: ");
    console.log(game.nowPlayerList);
    // [*] Wait until loaded and send playerList to next page
    mainWindow.webContents.once('did-finish-load', function(){
        
    })
})

ipcMain.on("questionTypeDetermined",function(e, choosenTypeStr){
    mainWindow.loadFile('./pages/question.html');
    mainWindow.webContents.once('did-finish-load', function(){
        // pick a question
        pickedQuestionDict = question.pickQuestion(choosenTypeStr);
        pickedQuestionDict.type = choosenTypeStr;
        // record game current question type
        game.nowType = choosenTypeStr;
        mainWindow.webContents.send('questionInformation', pickedQuestionDict);
    })
})

ipcMain.on("showAnswer", function(e){
    mainWindow.loadFile("./pages/correctAnswer.html");
    mainWindow.webContents.once('did-finish-load', function(){
        var type = game.nowType;
        var ret = question.getCorrectAnswer(type);
        mainWindow.webContents.send('showCorrectAnswer', ret.correctAnswer, ret.correctAnswerText, game.nowPlayerList);
    })
})

ipcMain.on("nextStage", function(e, correctList){
    // update score
    game.updateScore(correctList);
    // go to next stage
    game.goToNextStage();
    // 印出 result 以免程式突然 crash 還有救
    console.log("Result:")
    console.log(game.getResult());
    mainWindow.loadFile("./pages/choose.html");
    mainWindow.webContents.once('did-finish-load', function(){
    })
})
ipcMain.on("continueStage", function(e, correctList){
    // update score
    game.updateScore(correctList);
    // 印出 result 以免程式突然 crash 還有救
    console.log("Result:")
    console.log(game.getResult());

    mainWindow.loadFile("./pages/choose.html");
    mainWindow.webContents.once('did-finish-load', function(){
    })
})
ipcMain.on("end", function(e, correctList){
    // update score
    game.updateScore(correctList);
    // 印出 result 以免程式突然 crash 還有救
    console.log("Result:")
    console.log(game.getResult());
    mainWindow.loadFile("./pages/result.html");
    mainWindow.webContents.once('did-finish-load', function(){
        var playerListAndScore = game.getResult();
        mainWindow.webContents.send("playerListAndScore", playerListAndScore);
    })
})

function parse_csv(){
}