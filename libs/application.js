'use strict';

const Koa = require('koa');

const config = require('config');
const mongoose = require('../libs/mongoose');
const http = require('http');
const promisify = require("es6-promisify");

module.exports = class Application extends Koa {

  start() {
    return Promise.all([
      mongoose.connect(config.mongoose.uri, config.mongoose.options),
      new Promise((resolve, reject) => {
        this.server = this.listen(config.port, config.host, err => err ? reject(err) : resolve());
      })
    ]);
  }

  stop() {
    return Promise.all([
      mongoose.disconnect(),
      new Promise((resolve, reject) => {
        this.server.close(err => err ? reject(err) : resolve());
      })
    ]);
  }

};
