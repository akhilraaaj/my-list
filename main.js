const electron = require('electron');
const path = require('path');
const url = require('url');

process.env.NODE_ENV = 'production';

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;
let InfoWindow;

//listening for the app to be ready
app.on('ready', function() {
    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Quit App when closed
    mainWindow.on('closed', function() {
        app.quit();
    });

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Create add item menu window
function createAddWindow() {

    //create new window
    addWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Add Item',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    //load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Garbage Collection
    addWindow.on('close', function() {
        addWindow = null;
    });
}

//Catch items:add
ipcMain.on('item:add', function(e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Info page
function createInfoWindow() {

    //create new window
    InfoWindow = new BrowserWindow({
        width: 600,
        height: 630,
        title: 'About',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    //load html into window
    InfoWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'InfoWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Garbage Collection
    InfoWindow.on('close', function() {
        addWindow = null;
    });
}

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+X' : 'Ctrl+X',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'About',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click() {
                    createInfoWindow();
                }
            },
            {
                label: 'Quit',
                //Accelerator shortcut key to quit application
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

//if MAC, add empty object to menu
if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}