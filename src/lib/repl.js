
import os from 'os';
import path from 'path';
import app from 'app';

import replify from 'replify';
import http from 'http';

const replServer = http.createServer();

export default class Repl {
  static start() {
    replify({
      name: 'current',
      path: path.join(app.getPath('userData'), 'repl')
    },
    replServer);
  }
}

