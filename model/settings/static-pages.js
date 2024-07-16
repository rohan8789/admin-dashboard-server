const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const staticPageSchema = new Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, required:true },
    slugurl: { type: String, required: true },
    redirecturl: { type: String, required: true },
    redirect_mode: { type: String, required: true },
  },
  {
    timestamps: { required: true },
  }
);

staticPageSchema.plugin(uniqueValidator);

module.exports = mongoose.model("StaticPage", staticPageSchema);
