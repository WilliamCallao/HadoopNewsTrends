const express = require('express');
const router = express.Router();
const { executeWorkflow } = require('../ssh_11');

router.post('/process-text', async (req, res) => {
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

module.exports = router;
