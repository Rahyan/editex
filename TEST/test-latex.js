// test-latex.js
const latex = require('node-latex');
const fs = require('fs');
const path = require('path');

const content = `
\\documentclass{article}
\\begin{document}
Hello, World!
\\end{document}
`;

const inputDir = path.join(__dirname, 'latex_test');
const outputPath = path.join(inputDir, 'test.pdf');
const errorLogPath = path.join(inputDir, 'latexerrors.log');

if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}

fs.writeFileSync(path.join(inputDir, 'test.tex'), content);

const options = {
  errorLogs: errorLogPath, // Capture error logs
  inputs: inputDir, // Directory to search for includes
};

const output = fs.createWriteStream(outputPath);
const pdf = latex(fs.createReadStream(path.join(inputDir, 'test.tex')), options);

pdf.pipe(output);
pdf.on('error', (err) => {
  console.error(`Error executing LaTeX with node-latex: ${err}`);
  fs.readFile(errorLogPath, 'utf8', (logErr, data) => {
    if (logErr) {
      console.error('Error reading LaTeX error log file:', logErr);
    } else {
      console.error('LaTeX error log:', data);
    }
  });
});

pdf.on('finish', () => {
  console.log(`PDF generated at: ${outputPath} using node-latex`);
});
