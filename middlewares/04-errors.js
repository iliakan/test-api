'use strict';

module.exports = function*(next) {

  try {
    yield * next;
  } catch (e) {

    let preferredType = this.accepts('html', 'json');

    if (e.status) {
      this.status = e.status;

      this.body = {
        error: e.message
      };

    } else if (e.name == 'ValidationError') {

      this.status = 400;

      var errors = {};

      for (var field in e.errors) {
        errors[field] = e.errors[field].message;
      }

      this.body = {
        errors: errors
      };

    } else {
      this.body = "Error 500";
      this.status = 500;
      console.error(e.message, e.stack);
    }

  }
};
