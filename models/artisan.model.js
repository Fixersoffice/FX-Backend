const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const artisanSchema = new Schema(
  {
    artisanType: {
      type: String,
      required: [true, "Please enter your artisan type!"],
    },
  },
  {
    timestamps: true,
  }
);

const Artisan = model("Artisan", artisanSchema);

module.exports = Artisan;
