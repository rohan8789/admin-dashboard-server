const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Blog = require("../../model/posts/blogs");
const Admin = require("../../model/admin");

const createBlog = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ message: "can not register data without user input" });
  }

  const { heading, description, type, creatorId } = req.body;
  if (!heading || !description || !type || !creatorId || !req.file.path) {
    return res.status(400).json({ message: "Missing information" });
  }

  let imgPath = req.file.path.replace(/\\/g, "/");

  let findAdmin;
  try {
    findAdmin = await Admin.findById(creatorId);
  } catch (err) {
    return res.status(400).json({ message: "Creating a place failed..." });
  }
  if (!findAdmin) {
    return res
      .status(400)
      .json({ message: "User with this uid does not exist..." });
  }
//   console.log("This is creatorId", findAdmin);
  let fullName = findAdmin?.fname + " " + findAdmin?.lname;
  if (!fullName) fullName = findAdmin.name;

  let newBlog = new Blog({
    heading,
    description,
    image: imgPath,
    type,
    creatorId,
    createdBy: fullName,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newBlog.save({ session: sess });
    let f = 0;

    for (let i = 0; i < findAdmin.posts.length; i++) {
      if (findAdmin.posts[i].postModel === "Blog") {
        findAdmin.posts[i].postId.push(newBlog);
        f = 1;
      }
    }
    // console.log("Error above")
    if (f == 0) {
      findAdmin.posts.push({ postId: newBlog, postModel: "Blog" });
    } else {
      f = 0;
    }
    await findAdmin.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }

//   console.log(newNews);
  if (!newBlog) {
    return res.status(404).json({ message: "Post can not be created" });
  }
  return res.status(200).json({ message: "Success" });
};

const getBlog = async (req, res) => {
//   console.log("newsController hit");
  let getAllBlog;
  try {
    getAllBlog = await Blog.find({});
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!getAllBlog) return res.status(404).json({ message: "news not found" });
  return res.status(201).json({ news: getAllBlog });
};

const updateBlog = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ message: "can not register data without user input" });
  }

  const { heading, description, type, creatorId } = req.body;
  console.log(req.file);
  if (!heading || !description || !type || !req.file.path) {
    return res.status(400).json({ message: "Missing information" });
  }

  const id = req.params.id;
  let findBlog;
  try {
    findBlog = await Blog.findById({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  if (!findBlog) return res.status(404).json({ message: "News not found" });
//   console.log(findBlog);
  if (findBlog.creatorId.toString() !== creatorId) {
    // console.log(findNews, findNews.creatorId.toString(), creatorId);
    return res.status(404).json({ message: "you are not creator of this news" });
  }
  let imgPath = req.file.path.replace(/\\/g, "/");
  findBlog.heading = heading;
  findBlog.description = description;
  findBlog.type = type;
  findBlog.image = imgPath;
  try {
    await findBlog.save();
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  return res.status(201).json({ message: "success" });
};

const deleteBlog = async (req, res) => {
  const id = req.params.id;
  let findBlog;
  try {
    findBlog = await Blog.findById({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!findBlog) return res.status(404).json({ message: "News not found" });
  let deleteBlog;
  try {
    deleteBlog = await Blog.deleteOne({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!deleteBlog)
    return res.status(404).json({ message: "cannot be deleted" });
  return res.status(201).json({ message: "Success" });
};

module.exports = { createBlog, getBlog, updateBlog, deleteBlog };
