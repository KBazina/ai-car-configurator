const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend radi!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
