'use strict';

// http://test-api.javascript.ru/blabla/

const Application = require('./libs/application');
const app = new Application();

const config = require('config');

app.keys = [config.secret];

const mongoose = require('./libs/mongoose');

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});

// ---------------------------------------

const rest = require('./libs/rest');

fs.readdirSync('./models').forEach(file => require(`./models/${file}`));

for(let modelName in mongoose.models) {
  app.use(rest(mongoose.models[modelName]));
}

app.use(require('./libs/restAll')());


module.exports = app;
