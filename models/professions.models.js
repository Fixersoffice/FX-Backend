const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const professionalSchema = new Schema(
  {
    professionType: {
      type: String,
      required: [true, "Please enter your profession type!"],
    },
  },
  {
    timestamps: true,
  }
);

const Professional = model("Profession", professionalSchema);

module.exports = Professional;
