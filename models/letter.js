'use strict';

const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const Mailbox = require('./mailbox');

const schema = new mongoose.Schema({
  namespace: {
    type: String,
    required: true,
    index: true
  },
  mailbox: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mailbox',
    required: "Mailbox must be set"
  },
  subject: {
    type: String,
    required: "Subject is required"
  },
  body: {
    type: String,
    required: "Body is required"
  },
  to: {
    type: String,
    lowercase: true,
    trim: true,
    required: "'To' is required",
    validate: validate({
      validator: 'isEmail',
      passIfEmpty: true,
      message: "'To' must be a valid email"
    })
  }
});


module.exports = mongoose.model('Letter', schema);

