const express = require("express");
const { StatusCodes } = require("http-status-codes");

const Post = require("./models/post");
const ApiErrorResponse = require("./api_errors");
const AuthenticationService = require("./auth");

const router = express.Router();

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
