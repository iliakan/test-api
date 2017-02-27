'use strict';

const mongoose = require('./mongoose');
const Router = require('koa-router');
const config = require('config');

module.exports = function(Model) {

  let modelName = Model.modelName; // "User"

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
    // POST / => create
    .post('/', function*() {

      let totalCount = yield Model.count();
      if (totalCount >= config.rest.allLimit) {
        this.throw(429, `Can't create: Overall limit reached: ${totalCount} total exist`);
      }

      let count = yield Model.count({namespace: this.params.namespace});
      if (count >= config.rest.limit) {
        this.throw(429, `Can't create: limit reached, ${count} ${Model.collection.name} exist`);
      }

      let model = yield* Model.restCreate(this.params.namespace, this.request.body);

      this.body = Model.restFormat(model);
    })
    // DELETE / => del all
    .del('/', function*() {
      yield Model.remove({namespace: this.params.namespace});
      this.body = 'ok';
    })
    // GET / => get all
    .get('/', function*() {
      let models = yield Model.find({namespace: this.params.namespace});

      this.body = models.map(Model.restFormat);
    })
    // PATCH /:id
    .patch('/:' + modelName, function*() {
      let patched = yield* Model.restPatch(this[modelName], this.request.body);
      this.body = Model.restFormat(patched);
    })
    // GET /:id
    .get('/:' + modelName, function*() {
      this.body = Model.restFormat(this[modelName]);
    })
    // DELETE /:id
    .del('/:' + modelName, function*() {
      yield this[modelName].remove();
      this.body = 'ok';
    })
    .routes();

};
