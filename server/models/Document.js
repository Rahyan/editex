// server/models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: String,
  content: String,
});

module.exports = mongoose.model('Document', DocumentSchema);
