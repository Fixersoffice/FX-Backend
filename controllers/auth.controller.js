const mongoose = require("mongoose");
const ejs = require("ejs");
const User = require("../models/user.model");
const Otp = require('../models/otp.model');
const { signAccessToken } = require("../utils/libs/jwt-helper");
const { successResMsg, errorResMsg } = require("../utils/libs/response");
const AppError = require("../utils/libs/appError");
const catchAsync = require("../utils/libs/catchAsync");
const sendEMail = require("../utils/libs/email");
const { generateOtp, sendSMS } = require("../utils/libs/helperFunc");

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
    const { userNameOrEmail, password } = req.body;

    if (userNameOrEmail.includes("@")) {
      user = await User.findOne({ email: userNameOrEmail }).select([
        "+password",
        "+isVerified",
        "+block",
      ]);
      // console.log("user", user);
      if (!user) {
        return next(new AppError("PhoneNumber does not exist", 401));
      }
      if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
      }
      if (!user.isVerified) {
        return next(new AppError("Please verify your email address", 401));
      }
      if (user.block) {
        return next(new AppError("Your account has been blocked", 401));
      }
      createSendToken(user, 200, res);
    } else {
      user = await User.findOne({ username: userNameOrEmail }).select([
        "+password",
        "+isVerified",
        "+block",
      ]);
      if (!user) {
        return next(new AppError("User not found", 404));
      }
      if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect username or password", 401));
      }
      if (!user.isVerified) {
        return next(new AppError("Please verify your email address", 401));
      }
      if (user.block) {
        return next(new AppError("Your account has been blocked", 401));
      }
      createSendToken(user, 200, res);
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error, error.status));
  }
});

exports.createUser = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
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

      const newUser = await User.create({
        userName,
        email,
        phoneNumber,
        address,
        password,
      });

    const dataInfo = {
      message:
        "Hello, your account has been successfully registered. To complete the verification process, please check your email to verify your account.!",
    };

    await session.commitTransaction(); // comit Transaction
    session.endSession(); // end the Session

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    await session.abortTransaction(); // abort transaction which is a rollback
    session.endSession(); // end the session
    return next(new AppError(error, error.status));
  }
});

// forget password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get user based on email provieded
  const user = await User.findOne({phoneNumber : req.body.phoneNumber });

  // check if user exists
  if (!user) {
    return next(
      new AppError(
        "The user with the provided phone number does not exist",
        401
      )
    );
  }

  try {
    // sent token to the user email provided.
    const {otp, expiryDate} = generateOtp();

    const newOtp = await Otp.create({
      code: otp,
      user: user._id,
      expiresAt: expiryDate,
    });

    // const message = `Your OTP is ${OTP}`;

    // await sendSMS(message, user.phoneNumber);

    const dataInfo = { message: "Otp Sent Successfully!", otp };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError("There was an error sending an otp", 500));
  }
});

// reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {

  const { otp } = req.body;

  const otpData = await Otp.findOne({ code: otp }).populate("user");

  const { user } = otpData;

  if (!otpData) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (otpData.expiresAt < Date.now()) {
    return next(new AppError("OTP has expired", 400));
  }

  await Otp.deleteOne({code: otp});
  
  const { newPassword, retypeNewPassword } = req.body;

  if (!newPassword || !retypeNewPassword) {
    return next(
      new AppError("Please provide new password and retype password", 400)
    );
  }

  if (newPassword !== retypeNewPassword) {
    return next(new AppError("Password does not match", 400));
  }

  const userData = await User.findById(user._id).select("+password");

  userData.password = newPassword;
  await userData.save();
// // send mail notification

const dataInfo = {
  message: "Password reset successfull, you are now logged in!",
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
