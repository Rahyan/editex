// public/editor.js
const socket = io();
const editorArea = document.getElementById('editor-area');
const pdfPreview = document.getElementById('pdf-preview');
const renderMethodSelect = document.getElementById('render-method');
const documentId = 'some-document-id'; // Replace with actual document ID

socket.emit('join-document', documentId);

editorArea.addEventListener('input', () => {
  const content = editorArea.value;
  const method = renderMethodSelect.value;
  socket.emit('send-changes', content);

  // Send content to server for LaTeX rendering
  fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, method }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      pdfPreview.src = url;
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
});

socket.on('receive-changes', (content) => {
  editorArea.value = content;
});
