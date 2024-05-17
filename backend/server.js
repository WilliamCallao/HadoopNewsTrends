const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { setWebSocket } = require('./ssh_11'); 

const app = express();
const port = 3001;

// Configuración de middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({ origin: 'http://localhost:5173' }));

// Rutas
const newsRouter = require('./routes/news');
const concatenateDatesRouter = require('./routes/concatenateDates');
const processTextRouter = require('./routes/processText');
const concatenateTextsRouter = require('./routes/concatenateTexts');

app.use(newsRouter);
app.use(concatenateDatesRouter);
app.use(processTextRouter);
app.use(concatenateTextsRouter);

// WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  setWebSocket(ws);
  ws.on('message', (message) => {
    console.log('Mensaje recibido del cliente:', message);
  });
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
