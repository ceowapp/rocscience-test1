const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/data', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'vertices.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading JSON file');
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});