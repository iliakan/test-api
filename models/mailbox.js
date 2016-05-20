'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: "Title is required"
  }
});


module.exports = mongoose.model('Mailbox', schema);

