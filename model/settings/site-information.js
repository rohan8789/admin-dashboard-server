const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const siteInformationSchema = new Schema(
  {
    title: { type: String, required: true},
    logo: { type: String },
    f_icon: { type:String },
    m_mode: { type:String },
    i_mode: { type:String }
  },
  {
    timestamps: { required: true },
  }
);

siteInformationSchema.plugin(uniqueValidator);

module.exports = mongoose.model("SiteInformation", siteInformationSchema);
