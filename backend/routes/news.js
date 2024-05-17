const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

router.get('/news', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY' });
  }
  const results = [];
  const filePath = path.join(__dirname, '../data/articles.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      const articleDate = parseDate(data.fecha);
      if (articleDate >= start && articleDate <= end) {
        results.push(data);
      }
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

module.exports = router;
