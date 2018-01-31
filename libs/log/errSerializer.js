module.exports = function(err) {
  if (!err || !err.stack)
    return err;
  var obj = {
    message: err.message,
    name: err.name,
    stack: getFullErrorStack(err),
    code: err.code,
    signal: err.signal
  };

  // extend default message by validation error messages
  if (err.name === 'ValidationError') {
    const messages = Object.keys(err.errors).map(key => {
      return `${key}: ${err.errors[key].message}`;
    });

    obj.message = `${obj.message}. Errors: ${messages.join(', ')}`
  }
  
  return obj;
};

/*
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror) and
 * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
 *
 * Based on `dumpException` in
 * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
 */
function getFullErrorStack(ex) {
  var ret = ex.stack || ex.toString();
  if (ex.cause) {
    var cex = typeof (ex.cause) === 'function' ? ex.cause() : ex.cause;
    if (cex) {
      ret += '\nCaused by: ' + getFullErrorStack(cex);
    }
  }
  return ret;
}

