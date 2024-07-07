// server/latex/render.js
const latex = require('node-latex');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const renderLatexWithNodeLatex = (content, outputPath, callback) => {
  const inputDir = path.dirname(outputPath);

  // Ensure the directory exists
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }

  const options = {
    inputs: inputDir, // Directory to search for includes
  };

  const output = fs.createWriteStream(outputPath);
  const pdf = latex(content, options);

  pdf.pipe(output);
  pdf.on('error', (err) => {
    console.error(`Error executing LaTeX with node-latex: ${err}`);
    callback(err, null);
  });

  pdf.on('finish', () => {
    console.log(`PDF generated at: ${outputPath} using node-latex`);
    callback(null, outputPath);
  });
};

const renderLatexWithPdflatex = (content, outputPath, callback) => {
  const inputDir = path.dirname(outputPath);
  const inputPath = path.join(inputDir, 'input.tex');

  // Ensure the directory exists
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }

  fs.writeFileSync(inputPath, content);

  const command = `pdflatex -output-directory=${inputDir} ${inputPath}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing pdflatex: ${stderr}`);
      callback(stderr, null);
      return;
    }
    console.log(`pdflatex output: ${stdout}`);
    callback(null, outputPath);
  });
};

const renderLatex = (content, outputPath, method, callback) => {
  if (method === 'pdflatex') {
    renderLatexWithPdflatex(content, outputPath, callback);
  } else {
    renderLatexWithNodeLatex(content, outputPath, (err, result) => {
      if (err) {
        console.log('Fallback to pdflatex due to node-latex error');
        renderLatexWithPdflatex(content, outputPath, callback);
      } else {
        callback(null, result);
      }
    });
  }
};

module.exports = renderLatex;
