const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const professionSchema = new Schema(
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

const Profession = model("Profession", professionSchema);

module.exports = Profession;
