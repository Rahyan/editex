// server/routes/render.js
const express = require('express');
const renderLatex = require('../latex/render');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.post('/', (req, res) => {
  console.log('Received render request:', req.body);

  const { content, method } = req.body;
  if (!content) {
    console.error('No content provided');
    return res.status(400).send('Content is required');
  }

  const outputDir = path.join(__dirname, '..', 'latex');
  const outputPath = path.join(outputDir, 'input.pdf');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  renderLatex(content, outputPath, method, (error, resultPath) => {
    if (error) {
      console.error('Error rendering LaTeX', error);
      return res.status(500).send('Error rendering LaTeX');
    }

    // Check if the output file exists
    fs.access(resultPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Error accessing output file', err);
        return res.status(500).send('Error rendering LaTeX');
      }

      res.sendFile(resultPath, (err) => {
        if (err) {
          console.error('Error sending file', err);
          return res.status(500).send('Error rendering LaTeX');
        }
        fs.unlinkSync(resultPath); // Clean up the generated PDF
      });
    });
  });
});

module.exports = router;
