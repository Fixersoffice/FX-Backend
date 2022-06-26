const mongoose = require("mongoose");
const ejs = require("ejs");
const User = require("../models/user.model");
const { signAccessToken } = require("../utils/libs/jwt-helper");
const { successResMsg, errorResMsg } = require("../utils/libs/response");
const AppError = require("../utils/libs/appError");
const catchAsync = require("../utils/libs/catchAsync");
const sendEMail = require("../utils/libs/email");

const URL =
  process.env.NODE_ENV === "development"
    ? process.env.FIXERS_FRONT_END_DEV_URL
    : process.env.FIXERSS_FRONT_END_LIVE_URL;

const { FIXERS_ACCESS_TOKEN_SECRET_EXPIRES_IN } = process.env;

const createSendToken = (user, statusCode, res) => {
  const token = signAccessToken({
    id: user._id,
    email: user.email,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + FIXERS_ACCESS_TOKEN_SECRET_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  user.password = undefined;

  // res.cookie("jwt", token, cookieOptions);

  const dataInfo = { token, user };
  return successResMsg(res, 200, dataInfo);
};

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
    let user;
    const { userNameOrPhoneNumber, password } = req.body;

    if (userNameOrPhoneNumber.startsWith("+")) {
      user = await User.exists({ phoneNumber: userNameOrPhoneNumber }).select([
        "+password",
      ]);
      console.log("phoneNumber", user);
      if (!user) {
        return next(new AppError("PhoneNumber does not exist", 401));
      }
      if (!user || !(await User.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
      }
      if (!user.isVerified) {
        return next(new AppError("Please verify your email address", 401));
      }
      if (user.block) {
        return next(new AppError("Your account has been blocked", 401));
      }
      console.log(`it's working...`);
      createSendToken(user, 200, res);
    } else {
      // user = await User.findOne({ username: username }).select(
      //   "+password +isVerified +block"
      // );
      // if (!user) {
      //   return next(new AppError("User not found", 404));
      // }
      // if (!user || !(await user.correctPassword(password, user.password))) {
      //   return next(new AppError("Incorrect username or password", 401));
      // }
      // if (!user.isVerified) {
      //   return next(new AppError("Please verify your email address", 401));
      // }
      // if (user.block) {
      //   return next(new AppError("Your account has been blocked", 401));
      // }
      // console.log(`it's working...`);
      // createSendToken(user, 200, res);
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error, error.status));
  }
});

exports.createUser = catchAsync(async (req, res, next) => {
  const session = mongoose.startSession();
  session.startTransaction();
  try {
    const { userName, email, phoneNumber, address, password } = req.body;

    if (!userName || !email || !phoneNumber || !address || !password) {
      return next(
        new AppError(
          "Please provide username, email, phone number and password!",
          400
        )
      );
    }

    const user = await User.findOne({ email }).select("+password");

    const phoneNumberCheck = await User.exists({
      phoneNumber: req.body.phoneNumber,
    });

    if (user) {
      return next(new AppError("Email already exists!", 400));
    }

    if (phoneNumberCheck) {
      return next(new AppError("Phone Number already exists!", 400));
    }

    let userType = req.body.userType;

    if (userType === "Home Owner") {
    }

    const newUser = await User.create({
      userName,
      email,
      phoneNumber,
      address,
      password,
      userType,
    });

    // const data = {
    //   email: req.body.email,
    // };

    // const token = signAccessToken(data);
    // const verificationUrl = `${URL}/auth/email/verify/?verification_token=${token}`;

    // ejs.renderFile(
    //   path.join(__dirname, "../views/email-template.ejs"),
    //   {
    //     salutation: `Hi ${req.body.firstName}`,
    //     body: `Thank you for signing up on Fixers<br><br>

    //               Kindly <a href="${verificationUrl}">click here</a> to verify your email.
    //               <br><br>
    //               Need help? ask at <a href="mailto:hello@fixers.com">hello@fixers.com</a>
    //               `,
    //   },
    //   async (err, data) => {
    //     //use the data here as the mail body
    //     const options = {
    //       email: req.body.email,
    //       subject: "Verify Your Email",
    //       message: data,
    //     };
    //     await sendEmail(options);
    //   }
    // );

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
      body: `Thank you for signing up on Fixers<br><br>
    
                Kindly <a href="${verificationUrl}">click here</a> to verify your email.
                <br><br>
                Need help? ask at <a href="mailto:hello@fixers.com">hello@fixers.com</a>
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

exports.protect = catchAsync(async (req, res, next) => {
  let token, currentUser;
  if (
    req.headers.authorization &&
    req.headers.authorization.startWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.jwt;
  } else {
    return next(new AppError("Invalid authentication token", 401));
  }

  // token verification
  const decoded = await verifyAccessToken(token);

  // check if user still exist
  currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("User no longer exist", 401));
  }

  // check if user change password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently change password, please login again", 401)
    );
  }

  // grant access to user route
  req.user = currentUser;
  res.local.user = currentUser;

  next();
});

// forget password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get user based on email provieded
  const user = await User.findOne({ email: req.body.email });

  // check if user exists
  if (!user) {
    return next(
      new AppError(
        "The user with the provided email address does not exist",
        401
      )
    );
  }

  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // sent token to the user email provided.
    const resetUrl = `${URL}/auth/reset/resetPassword/?confirmationToken=${resetToken}`;

    ejs.renderFile(
      path.join(__dirname, "../views/email-template.ejs"),
      {
        salutation: `Hello ${user.firstName}`,
        body: `<p>We received a request to reset your password for your account. We're here to help! \n </p>
        <p>Simply click on the link below to set a new password: \n <p> 
        <strong><a href=${resetUrl}>Change my password</a></strong> \n
        <p>If you didn't ask to change your password, don't worry! Your password is still safe and you can delete this email.\n <p> 
        <p>If you dont use this link within 1 hour, it will expire. \n <p>`,
      },
      async (err, data) => {
        //use the data here as the mail body
        const options = {
          email: req.body.email,
          subject: "Password Reset!",
          message: data,
        };
        await sendEmail(options);
      }
    );

    const dataInfo = { message: "Password reset token sent!" };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email", 500));
  }
});

// reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resettoken: confirmationToken } = req.params;

  // get user based on the token
  const hashedToken = await crypto
    .createHash("sha256")
    .update(confirmationToken, "utf-8")
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // check if token is still valid / not Expired
  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // No need to turn off validator as it's required

  // Update passwordChangedAt property in userModel

  const loginUrl = `${URL}/login`;

  // send mail notification

  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hello ${user.firstName}`,
      body: `<p> PASSWORD CHANGE NOTIFICATION \n </p>
      <p>We are pleased to inform you that based on your recent request, your password has been changed successfully. \n <p> 
      <p>Click the link below to log in with your new password:\n <p> 
      <strong><a href=${loginUrl}>Login to your account</a></strong> \n`,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: user.email,
        subject: "Password Reset Successfull!",
        message: data,
      };
      await sendEmail(options);
    }
  );

  // Log in user -- send JWT
  createSendToken(user, 200, res);
});

// Updating password of a logged in user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Password Incorrect. Try again!!", 401));
  }

  // Update Password
  user.password = req.body.newPassword;
  await user.save();

  // send a mail
  ejs.renderFile(
    path.join(__dirname, "../views/email-template.ejs"),
    {
      salutation: `Hello ${user.firstName}`,
      body: `<p> You've successfully changed your password \n </p>
      <p>If you didnt perfom this action, contact support immediately  \n <p> `,
    },
    async (err, data) => {
      //use the data here as the mail body
      const options = {
        email: user.email,
        subject: "Password Changed!",
        message: data,
      };
      await sendEmail(options);
    }
  );

  // Log user in -- send JWT
  createSendToken(user, 200, res);
});
