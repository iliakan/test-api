"use strict";

const app = require('../app');
const request = require('request-promise');

var Task = require('../models/task');

function getURL(path) {
  return `http://localhost:3000${path}`;
}

describe("Task CRUD", function() {

  let newTaskData = {
    title: "Title",
    tags: [
      {class: "class1", title: "one"},
      {class: "class2", title: "two"}
    ]
  };

  before(function() {
    app.start();
  });

  after(function() {
    app.stop();
  });

  beforeEach(function*() {
    yield Task.remove({});
  });

  describe("POST /tasks", function() {
    it("creates a task", function*() {
      let body = yield request.post({
        url:    getURL('/tasks'),
        json:   true,
        body:   newTaskData
      });

      // exclude _id from the object
      body = JSON.parse(JSON.stringify(body), (k, v) => (k == '_id') ? undefined : v);
      body.should.be.eql(newTaskData);
    });

  });

});
