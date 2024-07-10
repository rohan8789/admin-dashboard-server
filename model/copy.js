const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const copyAdminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  count: {type: Number, default:3}
});

copyAdminSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Copy", copyAdminSchema);
