const ejs = require("ejs");
const User = require("../models/user.model");
const { createSendToken } = require("../utils/libs/createSendToken");
const { signAccessToken } = require("../utils/libs/jwt-helper");
const { successResMsg, errorResMsg } = require("../utils/libs/response");
const AppError = require("../utils/libs/appError");
const catchAsync = require("../utils/libs/catchAsync");
const sendEMail = require("../utils/libs/email");

const URL =
  process.env.NODE_ENV === "development"
    ? process.env.FIXERS_FRONT_END_DEV_URL
    : process.env.FIXERSS_FRONT_END_LIVE_URL;

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  successResMsg(res, 200, {
    message: "User successfully logged out",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }
    createSendToken(user, 200, res);
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    const { firstName, lastName, email, country, phoneNumber, password } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !country ||
      !password
    ) {
      return next(
        new AppError(
          "Please provide first name, last name, email, country, phone number and password!",
          400
        )
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (user) {
      return next(new AppError("Email already exists!", 400));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      country,
      phoneNumber,
      password,
      userType,
    });

    const data = {
      email: req.body.email,
    };

    const token = signAccessToken(data);
    const verificationUrl = `${URL}/auth/email/verify/?verification_token=${token}`;

    ejs.renderFile(
      path.join(__dirname, "../views/email-template.ejs"),
      {
        salutation: `Hi ${req.body.firstName}`,
        body: `Thank you for signing up on Payercoins<br><br>
      
                  Kindly <a href="${verificationUrl}">click here</a> to verify your email.
                  <br><br>
                  Need help? ask at <a href="mailto:hello@payercoins.com">hello@payercoins.com</a>
                  `,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: req.body.email,
          subject: "Verify Your Email",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = {
      message:
        "Hello, your account has been successfully registered. To complete the verification process, please check your email to verify your account.!",
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(error, error.status));
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { verification_token } = req.query;

  if (!verification_token) {
    return next(new AppError("Please provide verification token!", 400));
  }

  const decoded = await verifyAccessToken(verification_token);

  if (
    decoded.name !== "JsonWebTokenError" &&
    decoded.name !== "TokenExpiredError"
  ) {
    const user = await User.findOne({ email: decoded.email }).select(
      "+isVerified"
    );

    if (user.isVerified) {
      return next(new AppError("Your email is already verified!", 400));
    }

    user.isVerified = true;
    await user.save();

    const data = {
      message: "Your email has been successfully verified!",
    };

    return successResMsg(res, 200, data);
  } else if (decoded.name === "TokenExpiredError") {
    return next(new AppError("Your verification token has expired!", 400));
  } else if (decoded.name === "JsonWebTokenError") {
    return next(new AppError(decoded.message, 400));
  } else {
    return next(new AppError("Something went wrong", 400));
  }
});

exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select("+isVerified");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("User already verified", 400));
  }

  const data = {
    email: req.body.email,
  };

  const token = await signAccessToken(data);
  const verificationUrl = `${URL}/auth/email/verify/?verification_token=${token}`;

  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hi ${req.body.firstName}`,
      body: `Thank you for signing up on Payercoins<br><br>
    
                Kindly <a href="${verificationUrl}">click here</a> to verify your email.
                <br><br>
                Need help? ask at <a href="mailto:hello@payercoins.com">hello@payercoins.com</a>
                `,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: req.body.email,
        subject: "Verify Your Email",
        message: data,
      };
      await sendEmail(options);
    }
  );

  const dataInfo = {
    message: "Verification email re-sent",
  };

  return successResMsg(res, 200, dataInfo);
});
