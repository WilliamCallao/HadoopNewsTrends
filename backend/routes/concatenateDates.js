const express = require('express');
const router = express.Router();

router.post('/concatenate-dates', (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }

  const concatenatedDates = `${startDate} - ${endDate}`;
  res.json({ concatenatedDates });
});

module.exports = router;
