'use strict';

const mongoose = require('mongoose');
const validate = require('mongoose-validator');

const schema = new mongoose.Schema({
  fullName: {
    type: String,
    required: "Name must be present"
  },
  avatarUrl: {
    type: String,
    validate: validate({
      validator: 'isURL',
      passIfEmpty: true,
      message: 'Avatar must be an url'
    })
  },
  birthdate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['M', 'F']
  },
  address: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: "Email is required",
    validate: validate({
      validator: 'isEmail',
      passIfEmpty: true,
      message: 'Email must be valid'
    })
  }
});


module.exports = mongoose.model('User', schema);

