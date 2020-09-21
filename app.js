const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const User = require("./models/user");

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

const router = require("./router");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || "verysecret";

console.log(process.env.MONGO_URL);
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);
app.listen(PORT, "0.0.0.0");
console.log(`Escuchando en http://localhost:${PORT}`);
