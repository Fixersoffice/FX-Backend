const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const professionalSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    profileImage: {
      type: String,
      lowercase: true,
      default:
        "https://res.cloudinary.com/oluwatobiloba/image/upload/v1628753027/Grazac/avatar_cihz37.png",
    },
    rating: {
      type: Number,
      default: 0,
    },
    isProfessional: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Professional = model("Professional", professionalSchema);

module.exports = Professional;
