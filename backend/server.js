const express = require('express');
const cors = require('cors');
const { executeWorkflow } = require('./ssh_10'); // Asegúrate de que este archivo esté configurado correctamente

const app = express();

app.use(express.json()); // Usar el analizador de JSON integrado de Express
app.use(cors()); // Habilitar CORS

// Endpoint para procesar texto
app.post('/process-text', async (req, res) => {
  const { text } = req.body; // Asume que el texto viene en el cuerpo de la petición como { text: "ejemplo" }

  if (!text) {
    return res.status(400).send({ error: 'Texto vacío o inválido.' });
  }

  try {
    const result = await executeWorkflow(text, (msg) => console.log(msg));
    res.send({ result });
  } catch (error) {
    console.error('Error durante el flujo de trabajo:', error);
    res.status(500).send({ error: 'Error procesando el texto.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
