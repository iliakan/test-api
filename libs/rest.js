'use strict';

const mongoose = require('./mongoose');
const Router = require('koa-router');

module.exports = function(Model) {

  let modelName = Model.modelName; // User

  let router = new Router({
    prefix: '/' + Model.collection.name // /users
  });

  function format(model) {
    if (model.restFormat) {
      return model.restFormat();
    }

    let obj = model.toObject();
    delete obj.__v;
    return obj;
  }

  function* create(body) {
    if (Model.restCreate) {
      return yield Model.restCreate(body);
    } else {
      let paths = Object.keys(Model.schema.paths);
      paths = paths.filter(p => p != '_id' && p != '__v' && !p.includes('.'));

      let data = {};
      for (let key in body) {
        if (paths.includes(key)) {
          data[key] = body[key];
        }
      }

      return yield Model.create(data);
    }
  }

  router
    .param(modelName, function*(id, next) {
      try {
        // isValid does not help: it's always true if string length=12
        mongoose.Types.ObjectId.createFromHexString(id);
      } catch(e) {
        this.throw(404);
      }

      this[modelName] = yield Model.findById(id);

      if (!this[modelName]) {
        this.throw(404);
      }

      yield* next;
    })
    .post('/', function*() {

      let model = yield* create(this.request.body);

      this.body = format(model);
    })
    .get('/:' + modelName, function*() {
      this.body = format(this[modelName]);
    })
    .del('/:' + modelName, function*() {
      yield this[modelName].remove();
      this.body = 'ok';
    })
    .get('/', function*() {
      let models = yield Model.find({});

      this.body = models.map(format);
    });

  return router.routes();

};

