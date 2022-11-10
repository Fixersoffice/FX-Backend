// installed modules
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
// built-in modules
import { APP_NAME } from './config/config';
import { v1 } from './routes/v1';

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// use morgan
app.use(morgan('dev'));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss())
app.use(mongoSanitize());

// gzip compression
app.use(compression());

const whitelist = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:8888',
];

app.use(cors({
  origin: '*'
}));

app.get('/', (_req, res) => {
  res.status(200).json({
    service: `${APP_NAME}`,
    message: `Welcome to the ${APP_NAME}.`,
  });
});

app.use(v1);

// send back a 404 error for any unknown api request
app.use((_req, res, next) => {
    res.status(404).send({message: 'NOT FOUND'});
});


// handle error
// app.use(errorHandler);

export default app;
