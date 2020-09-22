const express = require("express");
const { StatusCodes } = require("http-status-codes");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const Post = require("./models/post");
const ApiErrorResponse = require("./api_errors");
const AuthenticationService = require("./auth");

// TODO Separate routers specific files
const router = express.Router();
const apiRouter = express.Router();

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
  passport.authenticate("login", async (error, user, info) => {
    try {
      if (error) {
        return next(error);
      }

      if (!user) {
        return next(new Error('No user'));
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// POST CRUD API

const POST_ENDPOINT = "/v1/posts";

apiRouter.use((request, response, next) => {
  console.log(`API Time: ${Date.now()}`);
  next();
});

apiRouter.post(POST_ENDPOINT, (request, response) => {
  const postObj = new Post(request.body);
  postObj.save((err) => (err ? console.log(err) : null));
  response.send(postObj);
});

apiRouter.get(POST_ENDPOINT, (request, response) => {
  Post.find({})
    .then((data) => {
      return response.send(data);
    })
    .catch(() => {
      const apiError = new ApiErrorResponse(response, StatusCodes.BAD_REQUEST);
      apiError.sendErrorResponse();
    });
});

apiRouter.get(
  `${POST_ENDPOINT}/:slug`,
  (request, response) => {
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

apiRouter.put(`${POST_ENDPOINT}/:slug`, (request, response) => {
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

apiRouter.delete(`${POST_ENDPOINT}/:slug`, (request, response) => {
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

module.exports = {
  router, apiRouter
};
