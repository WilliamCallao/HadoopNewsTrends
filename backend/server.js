const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Asegúrate de restringir esto en producción
    methods: ["GET", "POST"]
  }
});

app.use(bodyParser.json());
app.use(cors());

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  socket.on('uppercase', (text) => {
    console.log('Recibido texto para hacer uppercase:', text);
    const uppercasedText = text.toUpperCase();
    socket.emit('log', 'Texto recibido y convertido a mayúsculas.');
    socket.emit('uppercaseResult', uppercasedText);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
