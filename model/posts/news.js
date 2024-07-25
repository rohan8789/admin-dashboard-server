const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    type: { type: String, required: true },
    creatorId: { type: mongoose.Types.ObjectId, required: true, ref: "Admin" },
    createdBy: {type: String, required:true}
  },
  {
    timestamps: { required: true },
  }
);

newsSchema.plugin(uniqueValidator);

module.exports = mongoose.model("News", newsSchema);
