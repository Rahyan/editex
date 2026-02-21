// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const documentRoutes = require('./routes/documents');
const renderRoutes = require('./routes/render');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://127.0.0.1/editex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/documents', documentRoutes);
app.use('/api/render', renderRoutes);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
