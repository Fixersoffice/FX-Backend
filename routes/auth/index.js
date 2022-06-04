const express = require("express");
const router = express.Router();

const authController = require("../../controllers/auth.controller");

const { validateSchema } = require("../../utils/validations/index");

const {
  userSignUpSchema,
  loginSchema,
} = require("../../utils/validations/auth");

router.post(
  "/signup",
  validateSchema(userSignUpSchema),
  authController.createUser
);
router.post("/login", validateSchema(loginSchema), authController.login);
router.post("/logout", authController.logout);

module.exports.authRouter = router;
