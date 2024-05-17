const express = require('express');
const router = express.Router();

const sanitizeText = (text) => {
  let sanitizedText = text.toLowerCase();
  sanitizedText = sanitizedText.replace(/[^a-záéíóúñü\s]/g, ' '); 
  sanitizedText = sanitizedText.replace(/\n/g, ' ');
  sanitizedText = sanitizedText.replace(/\s+/g, ' ');
  return sanitizedText.trim();
};

router.post('/concatenate-texts', (req, res) => {
  const { articles } = req.body;

  if (!articles || !Array.isArray(articles)) {
    return res.status(400).json({ error: 'Articles are required and should be an array' });
  }

  const concatenatedTexts = articles.map(article => {
    const sanitizedTitle = sanitizeText(article.Titulo);
    const sanitizedBody = sanitizeText(article.Cuerpo);
    return `${sanitizedTitle} ${sanitizedBody}`;
  }).join(' ');

  res.json({ concatenatedText: concatenatedTexts });
});

module.exports = router;
