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
    required: "Title must be present"
  },
  tags: {
    type: [{
      class: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    }],
    default: []
  }
});


module.exports = mongoose.model('Task', schema);

