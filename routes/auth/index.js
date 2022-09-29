const express = require("express");
const router = express.Router();

const authController = require("../../controllers/auth.controller");

const { validateSchema } = require("../../utils/validations/index");

const {
  userSignUpSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} = require("../../utils/validations/auth");

const getId = (req, res, next) => {
  const { id } = req.user;
  req.params.id = id;
  next();
};

// AUTH ROUTES
router.post("/signup", validateSchema(userSignUpSchema), authController.createUser);

router.post("/login", validateSchema(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.post("/forgetPassword", validateSchema(forgotPasswordSchema), authController.forgetPassword);


// Restrict route to only AUTHENTICATED users
// router.use(authController.protect);
// Current User Routes
router.patch("/updatePassword", validateSchema(updatePasswordSchema), authController.protect, authController.updatePassword);

module.exports.authRouter = router;
