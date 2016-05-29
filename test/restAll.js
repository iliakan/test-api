"use strict";

const app = require('../app');
const request = require('request-promise');
const createEmptyDb = require('../libs/createEmptyDb');

const User = require('../models/user');
const Task = require('../models/task');

function getURL(path) {
  return `http://localhost:3000/test${path}`;
}

// remove all _id from obj recursively
function stripIds(obj) {
  return JSON.parse(JSON.stringify(obj), (k, v) => k == '_id' ? undefined : v);
}

describe("Rest All", function() {

  let existingUserData = {
    _id:       "573f1b79a5fe781a82f4394e",
    fullName:  "John Bull",
    avatarUrl: "http://avatar.com/john.jpg",
    email:     "john@test.ru",
    birthdate: new Date(2015, 1, 1).toJSON(),
    gender:    'M',
    address:   'address john'
  };

  let existingTaskData = {
    title: "Existing task",
    tags: [
      {class: "class", title: "one"},
    ]
  };

  let newTaskData = {
    title: "New task",
    tags: [
      {class: "class1", title: "one"},
      {class: "class2", title: "two"}
    ]
  };


  let newUserData = {
    fullName:  "Alice Cooper",
    avatarUrl: "http://avatar.com/alice.jpg",
    email:     "alice@test.ru",
    birthdate: new Date(2016, 1, 1).toJSON(),
    gender:    'F',
    address:   'address alice'
  };
  let existingUser, existingTask;

  before(function() {
    app.start();
  });

  after(function() {
    app.stop();
  });

  // load fixtures
  beforeEach(function*() {
    yield* createEmptyDb();
    existingUser = yield User.create(Object.assign({namespace: 'test'}, existingUserData));
    existingTask = yield Task.create(Object.assign({namespace: 'test'}, existingTaskData));
  });

  describe("POST /", function() {
    it("creates db users & tasks", function*() {
      let body = {
        users: [newUserData],
        tasks: [newTaskData]
      };

      let response = yield request.post({
        url:  getURL('/'),
        json: true,
        body
      });

      let responseStripId = stripIds(response);
      responseStripId.should.eql(body);
    });

    it("returns a validation error in case of bad data", function*() {
      let response = yield request.post({
        url:                     getURL('/'),
        json:                    true,
        resolveWithFullResponse: true,
        simple:                  false,
        body:                    {
          users: [{}] // let's try empty user
        }
      });

      console.log(response.body);
      response.statusCode.should.eql(400);
      response.body.errors.email.should.exist;
      response.body.errors.fullName.should.exist;
    });

  });

  describe("DELETE /", function() {
    it("clears all models", function*() {
      let response = yield request.del({
        url:  getURL('/'),
        json: true
      });

      (yield User.count()).should.eql(0);
      (yield Task.count()).should.eql(0);
    });

  });

  describe("GET /", function() {
    it("returns all models", function*() {
      let response = yield request.get({
        url:  getURL('/'),
        json: true
      });

      let responseStripId = stripIds(response);
      responseStripId.tasks.should.eql([stripIds(existingTaskData)]);
      responseStripId.users.should.eql([stripIds(existingUserData)]);

    });
  });

});
