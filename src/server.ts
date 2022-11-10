import { DB, DB_URI, IS_TEST } from './config/config';
import mongoose from "mongoose";

// import chalk from 'chalk';
import app from './app';

// UNCAUGHT EXCEPTIONS
// Application needs to be crashed then a tool will be needed to restart the APP
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!...');
  console.log({err});
  console.log(err.name, err.message);
  process.exit();
});

// CONNECT TO MONGODB

let dbURI: any;
if (DB.HOST && DB.NAME && DB.PASSWORD && DB.USER) {
  dbURI = `mongodb://${DB.USER}:${encodeURIComponent(DB.PASSWORD)}@${DB.HOST}:${DB.PORT}/${DB.NAME}`;
} else {
  dbURI = DB_URI;
}

if (IS_TEST) {
    dbURI += '-test';
}
  
mongoose
  .connect(dbURI)
  .then(() => {
    // console.log(chalk.green('Connected to DB successfully...'));
    console.log('Connected to DB successfully...')
  });

mongoose.connection.on('error', (err) => console.log(err.message));
mongoose.connection.on('disconnected', () =>
//   console.log(chalk.red('Mongoose connection closed'))
  console.log('Mongoose connection closed')
);

//   START SERVER

/**
 * Normalize a port into a number, string, or false.
 */
 const normalizePort = (val: any) => {
  const port = parseInt(val, 10);
  if (!Number.isNaN(port)) {
    return val;
  }

  if (port > 0) {
    return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || '8888');

/**
 * Event listener for HTTP server "listening" event.
 */

// create a http server
const server = app.listen(port, async () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
//   console.log(`Listening on ${chalk.green(bind)}`);
  console.clear();
  console.log(`Listening on ${bind}`)
});

// Catching Exceptions

// Application does not necessarily need to be crashed
process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION!...');
  console.log(err.name, err.message);
  console.log({err});
  server.close(() => {
    process.exit();
  });
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});