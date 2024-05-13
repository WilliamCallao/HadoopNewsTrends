const express = require('express');
const cors = require('cors');
const { executeWorkflow } = require('./ssh_11');

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors());

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});