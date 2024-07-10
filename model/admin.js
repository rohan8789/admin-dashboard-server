const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    fname: { type: String },
    lname: { type: String },
    phno: { type: Number },
    dob: { type: Date },
    empid: { type: String, unique: true },
    image: { type: String },
  },
  {
    timestamps: { required: true },
  }
);

adminSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Admin", adminSchema);
