const crypto = require("crypto");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcryptjs");
const validator = require("validator");

const fixersSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

fixersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // generate a salt
  const salt = await bcrypt.genSalt(10);

  // hash the password with the salt of 10 rounds
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

fixersSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

fixersSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

fixersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Cascade delete subjects when a user is deleted
fixersSchema.pre("remove", async function (next) {
  //console.log(`Business being removed from user ${this._id}-${this.businessName}`);
  await this.model("user").deleteMany({ _id: this._id });
  next();
});

fixersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // Password not changed
  return false;
};

fixersSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken, "utf8")
    .digest("hex");

  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;

  return resetToken;
};

const HomeOwner = model("Fixers", fixersSchema);

module.exports = HomeOwner;
