const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { executeWorkflow, setWebSocket } = require('./ssh_11'); 

const app = express();
const port = 3001;

// app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({ origin: 'http://localhost:3000' }));

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

app.post('/process-text', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const result = await executeWorkflow(text);
    res.json({ result });
  } catch (error) {
    console.error('Error during the workflow execution:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
