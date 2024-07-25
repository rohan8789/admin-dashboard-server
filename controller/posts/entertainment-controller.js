const mongoose = require('mongoose');
const { validationResult } = require("express-validator");

const Entertainment = require('../../model/posts/entertainment');
const Admin = require("../../model/admin");


const createEnt = async(req, res) =>{
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
      return res.status(400).json({ message: "User with this uid does not exist..." });
    }
    //   console.log("This is creatorId", findAdmin);
    let fullName = findAdmin?.fname + " " + findAdmin?.lname;
    if (!fullName) fullName = findAdmin.name;

    let newEnt = new Entertainment({
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
      await newEnt.save({ session: sess });
      let f = 0;

      for (let i = 0; i < findAdmin.posts.length; i++) {
        if (findAdmin.posts[i].postModel === "Entertainment") {
          findAdmin.posts[i].postId.push(newEnt);
          f = 1;
        }
      }
      if (f == 0) {
        findAdmin.posts.push({ postId: newEnt, postModel: "Entertainment" });
      } else {
        f = 0;
      }
      await findAdmin.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something went wrong" });
    }

    if (!newEnt) {
      return res.status(404).json({ message: "Post can not be created" });
    }
    return res.status(200).json({ message: "Success" });
}

const getEnt = async(req, res) => {
    let getAllEnt;
    try {
      getAllEnt = await Entertainment.find({});
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!getAllEnt)
      return res.status(404).json({ message: "news not found" });
    return res.status(201).json({ news: getAllEnt });
}

const updateEnt = async(req, res) =>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json({ message: "can not register data without user input" });
    }

    const { heading, description, type, creatorId } = req.body;

    if (!heading || !description || !type || !req.file.path) {
      return res.status(400).json({ message: "Missing information" });
    }

    const id = req.params.id;
    let findEnt;
    try {
      findEnt = await Entertainment.findById({ _id: id });
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    if (!findEnt) return res.status(404).json({ message: "News not found" });
    if (findEnt.creatorId.toString() !== creatorId) {
      return res
        .status(404)
        .json({ message: "you are not creator of this news" });
    }
    let imgPath = req.file.path.replace(/\\/g, "/");
    findEnt.heading = heading;
    findEnt.description = description;
    findEnt.type = type;
    findEnt.image = imgPath;
    try {
      await findEnt.save();
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    return res.status(201).json({ message: "success" });
}

const deleteEnt = async(req, res) =>{
  const id = req.params.id;
  let findEnt;
  try {
    findEnt = await Entertainment.findById({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!findEnt) return res.status(404).json({ message: "News not found" });
  let deleteEnt;
  try {
    deleteEnt = await Entertainment.deleteOne({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!deleteEnt)
    return res.status(404).json({ message: "cannot be deleted" });
  return res.status(201).json({ message: "Success" });
}

module.exports = {createEnt, getEnt, updateEnt, deleteEnt};