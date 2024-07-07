// server/routes/documents.js
const express = require('express');
const Document = require('../models/Document');

const router = express.Router();

router.post('/', async (req, res) => {
  const doc = new Document(req.body);
  await doc.save();
  res.status(201).send(doc);
});

router.get('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).send('Document not found');
  }
  res.send(doc);
});

module.exports = router;
