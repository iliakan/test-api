'use strict';

// ?delay=1000 => delay 1 s
module.exports = function*(next) {
  if (this.query.delay) {
    yield new Promise(res => setTimeout(res, this.query.delay));
  }

  yield* next;
};
