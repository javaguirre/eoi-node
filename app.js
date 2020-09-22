const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const User = require("./models/user");
const routers = require("./router");
const chatRouter = require("./routes/chat");

require("dotenv").config();

// PASSPORT
// TODO Move auth to an auth.js file
passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.create({ email, password });
        const error = null;
        return done(error, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isValid = await user.isValidPassword(password);

        if (!isValid) {
          return done(null, false, { message: "Email or password not valid" });
        }

        return done(null, user, { message: "Logged in" });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let messages = [
  {username: 'javi', text: 'Hola'},
  {username: 'javi', text: 'Prueba mensajes'}];

io.on('connection', (socket) => {
  socket.emit('messages', messages);

  socket.on('new-message', (data) => {
    console.log(`Ha llegado un nuevo mensaje: ${data.text}`);
    messages.push(data);

    socket.emit('messages', messages);
  });
});

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || "verysecret";

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
  })
  .catch((err) => console.log(err));

app.set("view engine", "pug");
app.use(session({ secret: SECRET, saveUninitialized: true, resave: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routers.router);
app.use(
  "/api",
  passport.authenticate('jwt', {session: false}),
  routers.apiRouter);
app.use('/chat', chatRouter);

server.listen(PORT, "0.0.0.0");
console.log(`Escuchando en http://localhost:${PORT}`);
