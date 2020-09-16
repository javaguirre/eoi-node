const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require('mongoose');

const router = require("./router");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'verysecret';

console.log(process.env.MONGO_URL);
mongoose.connect(
    process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true
    }).catch(err => console.log(err));

app.set('view engine', 'pug');
app.use(session(
    {secret: SECRET, saveUninitialized: true, resave: true}
))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", router);
app.listen(PORT, "0.0.0.0");
console.log(`Escuchando en http://localhost:${PORT}`);
