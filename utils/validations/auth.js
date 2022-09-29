const Joi = require("joi");

const userSignUpSchema = Joi.object({
  userName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .regex(/^[+][0-9]{11}/)
    .min(12)
    .max(14),
  password: Joi.string()
    // regex for 8 characters, special characters, numbers and upper and lower case letters
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?.!@$%^&*-]).{8,}$/)
    .min(8)
    .max(20)
    .required(),
  address: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  phoneNumber: Joi.string()
  .regex(/^[+][0-9]{11}/)
  .min(12)
  .max(14),
});

const resendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(20).required(),
  newPassword: Joi.string().min(8).max(20).required(),
});

const loginSchema = Joi.object({
  userNameOrEmail: Joi.string().required(),
  password: Joi.string().min(8).max(20).required(),
});

const resetPasswordSchema = Joi.object({
  otp: Joi.string().required().max(5),
  newPassword: Joi.string()
  // regex for 8 characters, special characters, numbers and upper and lower case letters
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?.!@$%^&*-]).{8,}$/)
  .min(8)
  .max(20)
  .required(),
  retypeNewPassword: Joi.string()
  // regex for 8 characters, special characters, numbers and upper and lower case letters
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?.!@$%^&*-]).{8,}$/)
  .min(8)
  .max(20)
  .required(),
});

module.exports = {
  userSignUpSchema,
  resendEmailVerificationSchema,
  updatePasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
