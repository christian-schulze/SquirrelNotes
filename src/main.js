
import Path from 'path';


import app from 'app';
import BrowserWindow from 'browser-window';
import AppMenu from './lib/app_menu';
import WindowState from './lib/window_state';
import Repl from './lib/repl';
import NotesController from './lib/notes_controller.js';


let mainWindow = null;
let mainWindowState = new WindowState('main', { width: 800, height: 600 });
let notesController = new NotesController();


app.on('ready', function() {
  mainWindow = new BrowserWindow({
    icon: Path.join(__dirname, 'images/app-icon.jpg'),
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    'min-width': 480,
    web_preferences: {
      web_security: false
    }
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadUrl(Path.join('file://', __dirname, '/html/index.html'));

  AppMenu.init(mainWindow);

  mainWindow.on('close', function() {
    mainWindowState.saveState(mainWindow);
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  notesController.defineIpcListeners();

  if (process.env.NODE_ENV === 'development') {
    Repl.start();
  }
});


app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

