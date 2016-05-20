'use strict';

const busboy = require('co-busboy');

module.exports = function* (next) {
  // the body isn't multipart, so busboy can't parse it
  if (!this.request.is('multipart/*')) {
    return yield* next;
  }

  const parser = busboy(this, {
    autoFields: true
  });

  if (yield parser) {
    this.throw(400, "Files are not allowed here");
  }

  for (let key in parser.fields) {
    this.request.body[key] = parser.fields[key];
  }

  yield* next;
};
