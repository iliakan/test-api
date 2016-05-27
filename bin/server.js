'use strict';

const app = require('../app');

app.start();

process.on('message', function(msg) {
  if (msg == 'shutdown') { // PM2 sends this on graceful reload
    app.stop();
  }
});

