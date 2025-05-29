const mongoose = require('mongoose');

const hisaabSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: [{
    key: { type: String, required: true },
    value: { type: Number, required: true }
  }],
  encrypted: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function () {
      return this.encrypted;
    }
  },
  label: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Hisaab', hisaabSchema);
