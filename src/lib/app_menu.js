"use strict";

let app = require('app');
let Menu = require('menu');
let BrowserWindow = require('browser-window');

function init(window) {
  let menus = [];

  menus.push({
    label: 'Squirrel Notes',
    submenu: [{
      label: 'About Squirrel notes',
      selector: 'orderFrontStandardAboutPanel:'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function() {
        app.quit();
      }
    }]
  });

  menus.push({
    label: 'Notes',
    submenu: [{
      label: 'Create',
      accelerator: 'CmdOrCtrl+N',
      click: function() {
        window.send('new_note', '');
      }
    }, {
      label: 'Edit',
      accelerator: 'CmdOrCtrl+E'
    }, {
      label: 'Delete',
      accelerator: 'CmdOrCtrl+D'
    }]
  });

  menus.push({
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }
    ]
  });

  if (process.env.NODE_ENV === 'development') {
    menus.push({
      label: 'Development',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function() {
          window.reloadIgnoringCache();
        }
      }, {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function() {
          window.toggleDevTools();
        }
      }]
    });
  }

  let menu = Menu.buildFromTemplate(menus);
  Menu.setApplicationMenu(menu);
}

module.exports = { init: init };

