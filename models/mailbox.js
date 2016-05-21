'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  namespace: {
    type: String,
    required: true,
    index: true
  },

  title: {
    type: String,
    required: "Title is required"
  }
});


module.exports = mongoose.model('Mailbox', schema);

