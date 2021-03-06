const express = require("express");
const router = express.Router();

const authController = require("../../controllers/auth.controller");

const { validateSchema } = require("../../utils/validations/index");

const {
  userSignUpSchema,
  resendEmailVerificationSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require("../../utils/validations/auth");
const { route } = require("express/lib/router");

const getId = (req, res, next) => {
  const { id } = req.user;
  req.params.id = id;
  next();
};

// AUTH ROUTES
router.post(
  "/signup",
  validateSchema(userSignUpSchema),
  authController.createUser
);
router.post("/login", validateSchema(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/email/verify", authController.verifyEmail);
router.put(
  "/email/verify/resend",
  validateSchema(resendEmailVerificationSchema),
  authController.resendEmailVerification
);
router.post(
  "/forgetPassword",
  validateSchema(resendEmailVerificationSchema),
  authController.forgetPassword
);
router.put(
  "/resetPassword/:resettoken",
  validateSchema(resetPasswordSchema),
  authController.resetPassword
);

// Restrict route to only AUTHENTICATED users
// router.use(authController.protect);

// Current User Routes
router.patch(
  "/updatePassword",
  validateSchema(updatePasswordSchema),
  authController.protect,
  authController.updatePassword
);

module.exports.authRouter = router;
