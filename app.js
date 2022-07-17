const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
// const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const key = require("./utils/libs/gen-keys");

const globalErrorHandler = require("./controllers/error.controller");

dotenv.config();

if (process.env.NODE_ENV === "production") {
  process.env.FIXERS_ACCESS_TOKEN_SECRET = key(64);
  process.env.FIXERS_COOKIE_SECRET = key(64);
}

const app = express();

// Set Security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit Request from same API
// const limiter = rateLimit({
//   max: 1000,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP, please try again in an hour!",
// });

//app.use("/api", limiter);

app.use(cors());

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("views"));

// Data sanitize against NoSQL Query Injection
app.use(mongoSanitize()); // Checks the request headers, query strings, params for malicious codes

// Import all routes
const { authRouter } = require("./routes/auth/index");
const { professionRouter } = require("./routes/profession/profession.route");

//default Route
app.get("/", (req, res) => {
  res.json({ message: `Welcome to Fixers API v1` });
});

// Home Route
app.get("/api/v1/home", (req, res) => {
  res.json({ message: `Welcome to Fixers API v1` });
});

//   Routes Middleware
app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/user", userRouter);
app.use("/api/v1/profession", professionRouter);

// Unhandled Routes
app.all("*", (req, res) => {
  res
    .status(404)
    .json({ message: `Can't find resource ${req.originalUrl} on this server` });
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
