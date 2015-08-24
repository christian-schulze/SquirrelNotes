"use strict";

let app = require('app');
let jetpack = require('fs-jetpack');

class WindowState {
  constructor(name, defaults) {
    this.userDataDir = jetpack.cwd(app.getPath('userData'));
    this.stateFile = `window-state-${name}.json`;

    this.state = this.userDataDir.read(this.stateFile, 'json') || {
      width: defaults.width,
      height: defaults.height
    };
  }

  saveState(window) {
    if (!window.isMaximized() && !window.isMinimized()) {
      let position = window.getPosition();
      this.state.x = position[0];
      this.state.y = position[1];

      let size = window.getSize();
      this.state.width = size[0];
      this.state.height = size[1];
    }

    this.state.isMaximized = window.isMaximized();
    this.userDataDir.write(this.stateFile, this.state, { atomic: true });
  }

  get x() { return this.state.x; }
  get y() { return this.state.y; }
  get width() { return this.state.width; }
  get height() { return this.state.height; }
  get isMaximized() { return this.state.isMaximized; }
}

module.exports = WindowState;

