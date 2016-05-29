'use strict';

const mongoose = require('./mongoose');
const Router = require('koa-router');
const config = require('config');

module.exports = function() {

  function modelByCollectionName(name) {
    for (let modelName in mongoose.models) {
      let Model = mongoose.models[modelName];
      if (Model.collection.name == name) return Model;
    }
    return null;
  }

  return new Router({
    prefix: '/:namespace'
  })
    // DELETE / => del all
    .del('/', function*() {

      for(let modelName in mongoose.models) {
        let Model = mongoose.models[modelName];
        if (!Model.restEnabled) continue;
        yield Model.remove({namespace: this.params.namespace});
      }

      this.body = 'ok';
    })
    // POST /  {users: [ ... ]} => create all
    .post('/', function*() {
      let response = {};
      for(let postModelName in this.request.body) {
        let Model = modelByCollectionName(postModelName);
        if (!Model) {
          this.throw(400, "No such model: " + postModelName);
        }

        if (!Model.restEnabled) {
          this.throw(400, "No rest on model: " + postModelName);
        }

        let modelsData = this.request.body[postModelName];
        if (!Array.isArray(modelsData)) {
          this.throw(400, "Not array: " + postModelName);
        }

        let totalCount = yield Model.count();
        if (totalCount +  modelsData.length >= config.rest.allLimit) {
          this.throw(429, `Can't create: Overall limit ${config.rest.allLimit} will be exceeded`);
        }

        let count = yield Model.count({namespace: this.params.namespace});
        if (count + modelsData.length >= config.rest.limit) {
          this.throw(429, `Can't create: limit ${config.rest.limit} for ${Model.collection.name} will be exceeded`);
        }

        response[postModelName] = [];

        for (let i = 0; i < modelsData.length; i++) {
          let modelData = modelsData[i];
          let model = yield* Model.restCreate(this.params.namespace, modelData);
          response[postModelName].push(Model.restFormat(model));
        }

      }

      this.body = response;
    })
    // GET / => get all
    .get('/', function*() {
      let response = {};

      for(let modelName in mongoose.models) {
        let Model = mongoose.models[modelName];
        if (!Model.restEnabled) continue;
        let models = yield Model.find({namespace: this.params.namespace});
        models = models.map(Model.restFormat);

        response[Model.collection.name] = models;
      }

      this.body = response;
    })

    .routes();

};
