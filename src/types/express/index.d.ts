import 'express';
// import { authPayload } from '../../dto/auth.dto';

declare module 'express' {
    interface Request {
        user?: any;
    }
}

// declare namespace Express {
//     export interface Request {
//         user: any;
//     }
//     export interface Response {
//         user: any;
//     }
//   }