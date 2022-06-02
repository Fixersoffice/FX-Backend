const { signAccessToken, verifyAccessToken } = require("./jwt-helper");
const { successResMsg } = require("./response");
require("dotenv").config();

const { FIXERS_ACCESS_TOKEN_SECRET_EXPIRES_IN } = process.env;

const createSendToken = async (user, statusCode, res) => {
  const token = signAccessToken({ id: user._id, email: user.email });

  const cookieOptions = {
    expires: new Date(
      Date.now() + FIXERS_ACCESS_TOKEN_SECRET_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  const dataInfo = { token, user };

  successResMsg(res, 200, dataInfo);
};

module.exports = { createSendToken };
