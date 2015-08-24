"use strict";

let os = require('os');
let path = require('path');
let app = require('app');

let replify = require('replify');
let replServer = require('http').createServer();

class Repl {
  static start() {
    replify({
      name: 'current',
      path: path.join(app.getPath('userData'), 'repl')
    },
    replServer);
  }
}

module.exports = Repl;

