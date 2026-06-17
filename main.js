const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  win.loadFile('pomodoro.html');

  win.on('closed', () => { win = null; });
}

function createTray() {
  // Tiny 16x16 tomato icon drawn as a PNG buffer
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Pomodoro Clock');

  const menu = Menu.buildFromTemplate([
    { label: 'Show', click: () => { if (win) win.show(); else createWindow(); } },
    { label: 'Hide', click: () => win && win.hide() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => { if (win) win.isVisible() ? win.hide() : win.show(); });
}

ipcMain.on('window-minimize', () => win && win.minimize());
ipcMain.on('window-close',   () => win && win.close());

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
