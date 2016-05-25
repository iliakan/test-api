'use strict';

const url = require('url');

// allow any CORS
module.exports = function* (next) {

  if (this.method != 'OPTIONS') {
    yield* next;
    return;
  }

  this.set('Access-Control-Allow-Methods', 'POST,GET,DELETE,PATCH');
  this.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  this.set('Access-Control-Max-Age', 86400);

  this.body = '';
};
