const express = require("express");
const { StatusCodes } = require("http-status-codes");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const Post = require("./models/post");
const ApiErrorResponse = require("./api_errors");
const AuthenticationService = require("./auth");

const router = express.Router();

// TODO Move routes for auth to another file
// TODO Move API routes to another file
router.get("/", (request, response) => {
  const mysession = request.session;

  if (mysession.email) {
    return response.redirect("/admin");
  }

  response.render("index");
});

router.get("/admin", (request, response) => {
  const session = request.session;

  if (session.email) {
    return response.render("admin", { email: session.email });
  }

  return response.redirect("/login");
});

router.get("/login", (request, response) => {
  const session = request.session;

  if (session.email) {
    return response.redirect("/admin");
  }

  response.render("login");
});

router.post("/login", (request, response) => {
  const isAuthenticated = AuthenticationService.authenticate(request.body);

  if (!isAuthenticated) {
    return response.render("login", { error: "Authentication failed" });
  }

  request.session.email = request.body.email;
  return response.redirect("/admin");
});

router.get("/logout", (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      console.log(err);
    }

    response.redirect("/");
  });
});

router.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (request, response, next) => {
    response.json({
      message: "Signup successful",
      user: request.user,
    });
  }
);

router.post("/api_login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An Error occurred");
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        //We don't want to store the sensitive information such as the
        //user password in the token so we pick only the email and id
        const body = { _id: user._id, email: user.email };
        //Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({ user: body }, "top_secret");
        //Send back the token to the user
        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// POST CRUD API

const POST_ENDPOINT = "/api/v1/posts";

router.use((request, response, next) => {
  console.log(`Router Time: ${Date.now()}`);
  next();
});

router.post(POST_ENDPOINT, (request, response) => {
  const postObj = new Post(request.body);
  postObj.save((err) => (err ? console.log(err) : null));
  response.send(postObj);
});

router.get(POST_ENDPOINT, (request, response) => {
  Post.find({})
    .then((data) => {
      return response.send(data);
    })
    .catch(() => {
      const apiError = new ApiErrorResponse(response, StatusCodes.BAD_REQUEST);
      apiError.sendErrorResponse();
    });
});

router.get(`${POST_ENDPOINT}/:slug`, (request, response) => {
  Post.findOne({ slug: request.params.slug })
    .then((data) => {
      if (!data) {
        throw new Error("Not found");
      }

      return response.send(data);
    })
    .catch(() => {
      const apiError = new ApiErrorResponse(response, StatusCodes.NOT_FOUND);
      apiError.sendErrorResponse();
    });
});

router.put(`${POST_ENDPOINT}/:slug`, (request, response) => {
  // TODO Validation request.json() and throw ValidationError
  // StatusCodes.BAD_REQUEST

  Post.findOneAndUpdate({ slug: request.params.slug }, request.body)
    .then((data) => {
      if (!data) {
        throw new Error("Not found");
      }

      response.send(data);
    })
    .catch(() => {
      const apiError = new ApiErrorResponse(response, StatusCodes.NOT_FOUND);
      apiError.sendErrorResponse();
    });
});

router.delete(`${POST_ENDPOINT}/:slug`, (request, response) => {
  Post.findOneAndDelete({ slug: request.params.slug }, request.body)
    .then((data) => {
      if (!data) {
        throw new Error("Not found");
      }

      response.status(StatusCodes.CREATED);
      response.end();
    })
    .catch(() => {
      const apiError = new ApiErrorResponse(response, StatusCodes.NOT_FOUND);
      apiError.sendErrorResponse();
    });
});

module.exports = router;
