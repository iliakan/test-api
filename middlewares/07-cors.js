'use strict';

const url = require('url');

// allow any CORS
module.exports = function* (next) {

  if (!this.get('Origin')) {
    yield* next;
    return;
  }

  let origin = url.parse(this.get('Origin'));
  this.set('Access-Control-Allow-Origin', origin.hostname);
  this.set('Access-Control-Allow-Credentials', 'true');

  yield* next;
};
