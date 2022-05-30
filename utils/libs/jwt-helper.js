const JWT = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.FIXERS_ACCESS_TOKEN_SECRET;

module.exports = {
  signAccessToken: (data) => {
    const payload = data;
    const options = {
      expiresIn: process.env.FIXERS_ACCESS_TOKEN_SECRET_EXPIRES_IN,
    };

    const token = JWT.sign(payload, secret, options);
    return token;
  },

  verifyAccessToken: (token) => {
    const payload = JWT.verify(token, secret);
    return payload;
  },
};
