const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    designation: { type: String, required: true },
    worktype: { type: String, required: true },
    creatorId: { type: mongoose.Types.ObjectId, required: true, ref: "Admin" },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: { required: true },
  }
);

jobSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Job", jobSchema);
