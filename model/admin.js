const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String },
    name: { type: String },
    fname: { type: String },
    lname: { type: String },
    phno: { type: Number },
    dob: { type: Date },
    empid: { type: String },
    image: { type: String },
    posts: [{
      postId: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
      postModel: { type: String, required: true, enum: ['News', 'Job', 'Blog', 'Event', 'Entertainment'] } 
    }],
  },
  {
    timestamps: { required: true },
  }
);

adminSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Admin", adminSchema);
