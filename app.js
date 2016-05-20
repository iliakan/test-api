'use strict';

const Application = require('./libs/application');
const app = new Application();

const config = require('config');

app.keys = [config.secret];

require('./libs/mongoose');

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});

// ---------------------------------------

const rest = require('./libs/rest');

['user', 'task', 'mailbox', 'letter'].forEach(model => {
  app.use(rest(require(`./models/${model}`)));
});

module.exports = app;
