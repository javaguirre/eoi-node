const express = require("express");
const app = express();
const router = require('./router');
const PORT = process.env.PORT || 3000;

app.use('/', router);

app.listen(PORT, '0.0.0.0');
console.log(`Escuchando en http://localhost:${PORT}`);
