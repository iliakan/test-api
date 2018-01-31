// Usage: require('log')()
// NB: this file is RELOADED for EVERY REQUIRE
// (cleared from cache, to get parent filename every time)

var Bunyan = require('./bunyan');
var errSerializer = require('./errSerializer');
var path = require('path');


// log.debug({req: ...})
// exported => new serializers can be added by other modules
var serializers = exports.serializers = {
  err:            errSerializer
};

var streams = require('./streams');

// if no name, then name is a parent module filename (or it's directory if index)
module.exports = function(name) {
  if (!name) {
    name = path.basename(module.parent.filename, '.js');
    if (name == 'index') {
      name = path.basename(path.dirname(module.parent.filename)) + '/index';
    }
  }

  var logger = new Bunyan({
    name:        name,
    streams:     streams,
    serializers: serializers
  });

  return logger;
};


delete require.cache[__filename];
