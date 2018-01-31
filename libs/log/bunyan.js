var Bunyan = require('bunyan');

/*
class Logger extends Bunyan {
  _applySerializers(fields, excludeFields) {
    super._applySerializers(fields, excludeFields);
    console.log("FIELDS", Object.keys(fields));
  }
}*/

module.exports = Bunyan;
