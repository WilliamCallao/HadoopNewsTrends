const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/uppercase', (req, res) => {
  const { text } = req.body;
  const uppercasedText = text.toUpperCase();
  res.json({ message: uppercasedText });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
