import * as dotenv from 'dotenv';
import { AppEnv } from '../types/config';
dotenv.config();

export const APP_NAME = process.env.APP_NAME;
export const APP_PORT = process.env.PORT;
export const ENVIRONMENT = (process.env.APP_ENV as AppEnv) || AppEnv.DEVELOPMENT;
export const IS_PRODUCTION = ENVIRONMENT === 'production';
export const IS_TEST = ENVIRONMENT === 'test';


export const DB = {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_USER_PWD,
    HOST: process.env.DB_HOST,
    NAME: process.env.DB_NAME,
    PORT: process.env.DB_PORT,
};

export const DB_URI = process.env.DB_URI;

export const LEFT_BEHIND_ACCESS_TOKEN_SECRET = process.env.LEFT_BEHIND_ACCESS_TOKEN_SECRET;
export const LEFT_BEHIND_ACCESS_TOKEN_SECRET_EXPIRES_IN = process.env.LEFT_BEHIND_ACCESS_TOKEN_SECRET_EXPIRES_IN;
