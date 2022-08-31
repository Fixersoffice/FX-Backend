require("dotenv").config();
const mongoose = require("mongoose");
const chalk = require("chalk");

// UNCAUGHT EXCEPTIONS
// Application needs to be crashed then a tool will be needed to restart the APP
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! ...");
  console.log({ err });
  console.log(err.name, err.message);
  process.exit;
});

const app = require("./app");

// const DB = process.env.FIXERS_DB.replace(
//   "<password>",
//   process.env.FIXERS_PASSWORD
// );
const DB = process.env.FIXERS_TEMP_DB;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.green("Connected to DB successfully"));
  });

mongoose.connection.on("error", (err) => console.log(err.message));
mongoose.connection.on("disconnected", () => {
  console.log(chalk.red("Mongoose connection closed"));
});

// START SERVER

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (!Number.isNaN(port)) {
    return val;
  }

  if (port > 0) {
    return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || "8888");

/**
 * Event listener for HTTP server "listening" event.
 */

// create a http server
const server = app.listen(port, async () => {
  const address = server.address();
  const bind = typeof address === "string" ? `pipe ${address}` : `port ${port}`;
  console.clear();
  console.log(`Listening on ${chalk.green(bind)}`);
});

// Catching Exceptions

// Application does not necessarily need to be crashed
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!...");
  console.log(err.name, err.message);
  console.log({ err });
  server.close(() => {
    process.exit();
  });
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
