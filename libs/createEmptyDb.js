'use strict';

const mongoose = require('mongoose');

module.exports = function*() {

  if (mongoose.connection.readyState == 2) { // connecting
    yield new Promise(resolve => mongoose.connection.on('open', resolve));
  }

  let db = mongoose.connection.db;
  yield* clearDatabase(db);

  yield* ensureIndexes();

  yield* ensureCapped();

};

function *clearDatabase(db) {

  var collections = yield new Promise(function(resolve, reject) {
    db.listCollections().toArray(function(err, items) {
      if (err) return reject(err);
      resolve(items);
    });
  });

  var collectionNames = collections
    .map(function(collection) {
      //console.log(collection.name);
      //var collectionName = collection.name.slice(db.databaseName.length + 1);
      if (collection.name.indexOf('system.') === 0) {
        return null;
      }
      return collection.name;
    })
    .filter(Boolean);

  yield collectionNames.map(function(name) {
    return new Promise((res, rej) => db.dropCollection(name, err => err ? rej(err) : res()));
  });

}



// wait till indexes are complete, especially unique
// required to throw errors
function *ensureIndexes(db) {

  yield mongoose.modelNames().map(function(modelName) {
    var model = mongoose.models[modelName];
    return new Promise((res, rej) => model.ensureIndexes(err => err ? rej(err): res()));
  });

}


// ensure that capped collections are actually capped
function *ensureCapped(db) {

  yield mongoose.modelNames().map(function(modelName) {
    var model = mongoose.models[modelName];
    var schema = model.schema;
    if (!schema.options.capped) return;

    return new Promise((res, rej) => db.command(
      {convertToCapped: model.collection.name, size: schema.options.capped},
      err => err ? rej(err): res()
    ));
  });
}

