'use strict';

const mongoose = require('./mongoose');
const Router = require('koa-router');
const config = require('config');

// TODO
// Delete /users
// PUT
// PATCH
module.exports = function(Model) {

  let modelName = Model.modelName; // "User"

  function format(model) {
    if (model.restFormat) {
      return model.restFormat();
    }

    let obj = model.toObject();
    delete obj.namespace;
    delete obj.__v;
    return obj;
  }

  function* create(namespace, body) {
    let data = {namespace};

    if (Model.restCreate) {
      return yield Model.restCreate(Object.assign(data, body));
    } else {
      let paths = Object.keys(Model.schema.paths);
      paths = paths.filter(p => p != '_id' && p != '__v' && !p.includes('.'));

      for (let key in body) {
        if (~paths.indexOf(key)) {
          data[key] = body[key];
        }
      }

      return yield Model.create(data);
    }
  }

  function* patch(model, body) {

    if (model.restPatch) {
      return yield model.restPatch(body);
    } else {
      let paths = Object.keys(Model.schema.paths);
      paths = paths.filter(p => p != '_id' && p != '__v' && !p.includes('.'));

      for (let key in body) {
        if (~paths.indexOf(key)) {
          model[key] = body[key];
        }
      }

      yield model.save();
    }
  }

  return new Router({
    prefix: '/:namespace/' + Model.collection.name // "users"
  })
      .param(modelName, function*(id, next) {
        try {
          // isValid does not help: it's always true if string length=12
          mongoose.Types.ObjectId.createFromHexString(id);
        } catch (e) {
          this.throw(404);
        }

        this[modelName] = yield Model.findOne({_id: id, namespace: this.params.namespace});

        if (!this[modelName]) {
          this.throw(404);
        }

        yield* next;
      })
      .post('/', function*() {

        let totalCount = yield Model.count();
        if (totalCount >= config.rest.allLimit) {
          this.throw(429, `Can't create: Overall limit reached: ${totalCount} total exist`);
        }

        let count = yield Model.count({namespace: this.params.namespace});
        if (count >= config.rest.limit) {
          this.throw(429, `Can't create: limit reached, ${count} ${Model.collection.name} exist`);
        }

        let model = yield* create(this.params.namespace, this.request.body);

        this.body = format(model);
      })
      .patch('/:' + modelName, function*() {
        yield* patch(this[modelName], this.request.body);
        this.body = format(this[modelName]);
      })
      .get('/:' + modelName, function*() {
        this.body = format(this[modelName]);
      })
      .del('/', function*() {
        yield Model.remove({});
        this.body = 'ok';
      })
      .del('/:' + modelName, function*() {
        yield this[modelName].remove();
        this.body = 'ok';
      })
      .get('/', function*() {
        let models = yield Model.find({namespace: this.params.namespace});

        this.body = models.map(format);
      })
      .routes();

};
