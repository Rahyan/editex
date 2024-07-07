// server/latex/render.js
const latex = require('node-latex');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const renderLatexWithNodeLatex = (content, outputPath, callback) => {
  const inputDir = path.dirname(outputPath);
  const inputPath = path.join(inputDir, 'input.tex');
  const errorLogPath = path.join(inputDir, 'latexerrors.log');

  // Ensure the directory exists
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }

  fs.writeFileSync(inputPath, content);

  const options = {
    errorLogs: errorLogPath, // Capture error logs
    inputs: inputDir, // Directory to search for includes
  };

  const output = fs.createWriteStream(outputPath);
  const pdf = latex(fs.createReadStream(inputPath), options);

  pdf.pipe(output);
  pdf.on('error', (err) => {
    console.error(`Error executing LaTeX with node-latex: ${err}`);
    // Read the error log file and include its contents in the callback
    fs.readFile(errorLogPath, 'utf8', (logErr, data) => {
      if (logErr) {
        console.error('Error reading LaTeX error log file:', logErr);
        callback(err, null);
      } else {
        console.error('LaTeX error log:', data);
        callback(err, data);
      }
    });
  });

  pdf.on('finish', () => {
    console.log(`PDF generated at: ${outputPath} using node-latex`);
    callback(null, outputPath);
  });
};

const renderLatexWithPdflatex = (content, outputPath, callback) => {
  const inputDir = path.dirname(outputPath);
  const inputPath = path.join(inputDir, 'input.tex');
  const logPath = path.join(inputDir, 'pdflatex.log');

  // Ensure the directory exists
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }

  fs.writeFileSync(inputPath, content);

  const command = `pdflatex -output-directory=${inputDir} ${inputPath} > ${logPath} 2>&1`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing pdflatex: ${stderr}`);
      // Read the log file and include its contents in the callback
      fs.readFile(logPath, 'utf8', (logErr, data) => {
        if (logErr) {
          console.error('Error reading pdflatex log file:', logErr);
          callback(stderr, null);
        } else {
          console.error('pdflatex log:', data);
          callback(stderr, data);
        }
      });
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
