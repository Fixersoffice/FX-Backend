const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const professionalSchema = new Schema(
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

const Professional = model("Profession", professionalSchema);

module.exports = Professional;
